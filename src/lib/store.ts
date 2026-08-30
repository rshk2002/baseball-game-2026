import type { GameStatus } from "./game";

/**
 * 게임 저장소 인터페이스.
 * - 운영: Supabase Postgres (store-supabase.ts)
 * - 개발 fallback: 인메모리 (store-memory.ts, SUPABASE 환경변수 없을 때)
 */

export type GameRecord = {
  id: string;
  nickname: string;
  answer: string;
  status: GameStatus;
  tryCount: number;
  createdAt: string;
  finishedAt: string | null;
};

export type GuessRecord = {
  guess: string;
  strike: number;
  ball: number;
  out: number;
  createdAt: string;
};

export type RankingRow = {
  nickname: string;
  gameCnt: number;
  winCnt: number;
  winRate: number;
  winTryAvg: number | null;
};

export type RankingSort = "wins" | "winRate" | "avgTries";

export interface GameStore {
  createGame(nickname: string, answer: string): Promise<GameRecord>;
  getGame(id: string): Promise<GameRecord | null>;
  /** 시도 기록 + tryCount 증가. 승리 시 status/finishedAt 갱신 */
  recordGuess(
    gameId: string,
    guess: GuessRecord,
    win: boolean
  ): Promise<void>;
  /** 포기 처리 */
  giveUp(gameId: string): Promise<void>;
  getRankings(sort: RankingSort, limit: number): Promise<RankingRow[]>;
}

let store: GameStore | null = null;

export async function getStore(): Promise<GameStore> {
  if (store) return store;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { SupabaseStore } = await import("./store-supabase");
    store = new SupabaseStore();
  } else {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다."
      );
    }
    console.warn(
      "[store] SUPABASE 환경변수가 없어 인메모리 저장소를 사용합니다 (개발 전용, 재시작 시 초기화)."
    );
    const { MemoryStore } = await import("./store-memory");
    store = new MemoryStore();
  }
  return store;
}
