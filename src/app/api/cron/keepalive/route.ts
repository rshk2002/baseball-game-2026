import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

/**
 * GET /api/cron/keepalive — Vercel Cron이 매일 호출 (vercel.json).
 * Supabase 무료 플랜의 7일 무활동 자동 일시정지를 막기 위한 가벼운 DB 읽기.
 * CRON_SECRET 환경변수가 설정되어 있으면 Vercel Cron의 인증 헤더를 검증한다.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const store = await getStore();
  const rankings = await store.getRankings("wins", 1);

  return NextResponse.json({
    ok: true,
    dbAlive: true,
    sampleRows: rankings.length,
    at: new Date().toISOString(),
  });
}
