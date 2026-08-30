import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import type { RankingSort } from "@/lib/store";

const SORTS: RankingSort[] = ["wins", "winRate", "avgTries"];
const RANKING_LIMIT = 50;

/** GET /api/stats?sort=wins|winRate|avgTries — 실시간 랭킹 */
export async function GET(request: NextRequest) {
  const sortParam = request.nextUrl.searchParams.get("sort") ?? "wins";
  const sort = SORTS.includes(sortParam as RankingSort)
    ? (sortParam as RankingSort)
    : "wins";

  const store = await getStore();
  const rankings = await store.getRankings(sort, RANKING_LIMIT);

  return NextResponse.json({ sort, rankings });
}
