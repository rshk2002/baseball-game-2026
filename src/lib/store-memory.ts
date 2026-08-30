import { randomUUID } from "crypto";
import type {
  GameRecord,
  GameStore,
  GuessRecord,
  RankingRow,
  RankingSort,
} from "./store";

/**
 * 개발용 인메모리 저장소.
 * next dev(단일 프로세스)에서만 유효하며 서버 재시작 시 초기화된다.
 * 서버리스 환경에서는 요청 간 상태가 유지되지 않으므로 운영에서는 사용 불가.
 */
export class MemoryStore implements GameStore {
  private games = new Map<string, GameRecord>();
  private guesses = new Map<string, GuessRecord[]>();

  async createGame(nickname: string, answer: string): Promise<GameRecord> {
    const game: GameRecord = {
      id: randomUUID(),
      nickname,
      answer,
      status: "IN_PROGRESS",
      tryCount: 0,
      createdAt: new Date().toISOString(),
      finishedAt: null,
    };
    this.games.set(game.id, game);
    this.guesses.set(game.id, []);
    return game;
  }

  async getGame(id: string): Promise<GameRecord | null> {
    return this.games.get(id) ?? null;
  }

  async recordGuess(
    gameId: string,
    guess: GuessRecord,
    win: boolean
  ): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) throw new Error("game not found");
    this.guesses.get(gameId)?.push(guess);
    game.tryCount += 1;
    if (win) {
      game.status = "WIN";
      game.finishedAt = new Date().toISOString();
    }
  }

  async giveUp(gameId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) throw new Error("game not found");
    game.status = "GIVE_UP";
    game.finishedAt = new Date().toISOString();
  }

  async getRankings(sort: RankingSort, limit: number): Promise<RankingRow[]> {
    const byNickname = new Map<string, GameRecord[]>();
    for (const game of this.games.values()) {
      if (game.status === "IN_PROGRESS") continue;
      const list = byNickname.get(game.nickname) ?? [];
      list.push(game);
      byNickname.set(game.nickname, list);
    }

    const rows: RankingRow[] = [];
    for (const [nickname, games] of byNickname) {
      const wins = games.filter((g) => g.status === "WIN");
      rows.push({
        nickname,
        gameCnt: games.length,
        winCnt: wins.length,
        winRate: Number((wins.length / games.length).toFixed(3)),
        winTryAvg:
          wins.length > 0
            ? Number(
                (
                  wins.reduce((sum, g) => sum + g.tryCount, 0) / wins.length
                ).toFixed(2)
              )
            : null,
      });
    }

    return sortRankings(rows, sort).slice(0, limit);
  }
}

export function sortRankings(rows: RankingRow[], sort: RankingSort) {
  const sorted = [...rows];
  switch (sort) {
    case "winRate":
      sorted.sort(
        (a, b) => b.winRate - a.winRate || b.winCnt - a.winCnt
      );
      break;
    case "avgTries":
      // 평균 시도가 적을수록 상위. 승리 없는 사용자는 뒤로.
      sorted.sort((a, b) => {
        if (a.winTryAvg === null) return 1;
        if (b.winTryAvg === null) return -1;
        return a.winTryAvg - b.winTryAvg || b.winCnt - a.winCnt;
      });
      break;
    default:
      sorted.sort((a, b) => b.winCnt - a.winCnt || b.winRate - a.winRate);
  }
  return sorted;
}
