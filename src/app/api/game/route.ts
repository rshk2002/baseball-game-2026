import { NextRequest, NextResponse } from "next/server";
import { generateAnswer, validateNickname } from "@/lib/game";
import { getStore } from "@/lib/store";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/** POST /api/game — 게임 생성. 정답은 서버에만 저장하고 gameId만 반환한다. */
export async function POST(request: NextRequest) {
  if (!rateLimit(`create:${clientKey(request)}`).allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  let body: { nickname?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const validation = validateNickname(body.nickname ?? "");
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const store = await getStore();
  const game = await store.createGame(validation.nickname, generateAnswer());

  return NextResponse.json({ gameId: game.id, nickname: game.nickname });
}
