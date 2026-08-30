import { NextRequest, NextResponse } from "next/server";
import { isWin, judge, validateGuess } from "@/lib/game";
import { getStore } from "@/lib/store";

/**
 * POST /api/game/[id]/guess — 판정.
 * 3 스트라이크면 status가 WIN으로 바뀌고 그때만 정답을 응답에 포함한다.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { guess?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const validation = validateGuess(body.guess ?? "");
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const store = await getStore();
  const game = await store.getGame(id);
  if (!game) {
    return NextResponse.json({ error: "GAME_NOT_FOUND" }, { status: 404 });
  }
  if (game.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "GAME_ALREADY_ENDED" }, { status: 409 });
  }

  const result = judge(game.answer, validation.guess);
  const win = isWin(result);
  // recordGuess 전에 계산: 저장소 구현에 따라 game 객체가 갱신될 수 있음
  const tryCount = game.tryCount + 1;

  await store.recordGuess(
    game.id,
    { ...result, guess: validation.guess, createdAt: new Date().toISOString() },
    win
  );

  return NextResponse.json({
    ...result,
    status: win ? "WIN" : "IN_PROGRESS",
    tryCount,
    ...(win ? { answer: game.answer } : {}),
  });
}
