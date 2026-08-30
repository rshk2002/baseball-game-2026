import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

/** POST /api/game/[id]/giveup — 포기. 정답을 공개하고 GIVE_UP으로 기록한다. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const store = await getStore();
  const game = await store.getGame(id);
  if (!game) {
    return NextResponse.json({ error: "GAME_NOT_FOUND" }, { status: 404 });
  }
  if (game.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "GAME_ALREADY_ENDED" }, { status: 409 });
  }

  await store.giveUp(game.id);

  return NextResponse.json({ status: "GIVE_UP", answer: game.answer });
}
