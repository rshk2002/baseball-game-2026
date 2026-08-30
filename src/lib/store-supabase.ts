import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  GameRecord,
  GameStore,
  GuessRecord,
  RankingRow,
  RankingSort,
} from "./store";
import type { GameStatus } from "./game";

/**
 * Supabase Postgres 저장소.
 * 서버(API Route)에서만 service role 키로 접근한다. 클라이언트에 키를 노출하지 않는다.
 * 스키마: supabase/schema.sql
 */

type GameRow = {
  id: string;
  nickname: string;
  answer: string;
  status: GameStatus;
  try_count: number;
  created_at: string;
  finished_at: string | null;
};

function toGameRecord(row: GameRow): GameRecord {
  return {
    id: row.id,
    nickname: row.nickname,
    answer: row.answer,
    status: row.status,
    tryCount: row.try_count,
    createdAt: row.created_at,
    finishedAt: row.finished_at,
  };
}

export class SupabaseStore implements GameStore {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }

  async createGame(nickname: string, answer: string): Promise<GameRecord> {
    const { data, error } = await this.client
      .from("games")
      .insert({ nickname, answer })
      .select()
      .single();
    if (error) throw error;
    return toGameRecord(data as GameRow);
  }

  async getGame(id: string): Promise<GameRecord | null> {
    const { data, error } = await this.client
      .from("games")
      .select()
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? toGameRecord(data as GameRow) : null;
  }

  async recordGuess(
    gameId: string,
    guess: GuessRecord,
    win: boolean
  ): Promise<void> {
    const { error: guessError } = await this.client.from("guesses").insert({
      game_id: gameId,
      guess: guess.guess,
      strike: guess.strike,
      ball: guess.ball,
      out: guess.out,
    });
    if (guessError) throw guessError;

    const { error: rpcError } = await this.client.rpc("increment_try", {
      p_game_id: gameId,
      p_win: win,
    });
    if (rpcError) throw rpcError;
  }

  async giveUp(gameId: string): Promise<void> {
    const { error } = await this.client
      .from("games")
      .update({ status: "GIVE_UP", finished_at: new Date().toISOString() })
      .eq("id", gameId);
    if (error) throw error;
  }

  async getRankings(sort: RankingSort, limit: number): Promise<RankingRow[]> {
    const orderMap: Record<
      RankingSort,
      { column: string; ascending: boolean }[]
    > = {
      wins: [
        { column: "win_cnt", ascending: false },
        { column: "win_rate", ascending: false },
      ],
      winRate: [
        { column: "win_rate", ascending: false },
        { column: "win_cnt", ascending: false },
      ],
      avgTries: [
        { column: "win_try_avg", ascending: true },
        { column: "win_cnt", ascending: false },
      ],
    };

    let query = this.client.from("rankings").select();
    if (sort === "avgTries") {
      query = query.not("win_try_avg", "is", null);
    }
    for (const { column, ascending } of orderMap[sort]) {
      query = query.order(column, { ascending, nullsFirst: false });
    }
    const { data, error } = await query.limit(limit);
    if (error) throw error;

    type RankingsRow = {
      nickname: string;
      game_cnt: number;
      win_cnt: number;
      win_rate: number;
      win_try_avg: number | null;
    };
    return (data as RankingsRow[]).map((row) => ({
      nickname: row.nickname,
      gameCnt: row.game_cnt,
      winCnt: row.win_cnt,
      winRate: Number(row.win_rate),
      winTryAvg: row.win_try_avg === null ? null : Number(row.win_try_avg),
    }));
  }
}
