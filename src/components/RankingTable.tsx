"use client";

import { useEffect, useState } from "react";

type RankingRow = {
  nickname: string;
  gameCnt: number;
  winCnt: number;
  winRate: number;
  winTryAvg: number | null;
};

export type RankingSort = "wins" | "winRate" | "avgTries";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingTable({
  sort,
  limit,
  compact = false,
}: {
  sort: RankingSort;
  limit?: number;
  compact?: boolean;
}) {
  // sort가 바뀌면 result.sort와 달라져 로딩 상태로 취급된다
  const [result, setResult] = useState<{
    sort: RankingSort;
    rows: RankingRow[] | "failed";
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/stats?sort=${sort}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setResult({ sort, rows: data.rankings ?? [] });
      })
      .catch(() => {
        if (!cancelled) setResult({ sort, rows: "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, [sort]);

  if (result === null || result.sort !== sort) {
    return <p className="py-6 text-center text-sm text-muted">불러오는 중...</p>;
  }
  if (result.rows === "failed") {
    return <p className="py-6 text-center text-sm text-muted">랭킹을 불러오지 못했어요.</p>;
  }
  const rows = result.rows;
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        아직 기록이 없어요. 첫 번째 기록의 주인공이 되어보세요!
      </p>
    );
  }

  const shown = limit ? rows.slice(0, limit) : rows;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-muted">
          <th className="pb-2 pl-2 font-normal">순위</th>
          <th className="pb-2 font-normal">닉네임</th>
          <th className="pb-2 text-right font-normal">승</th>
          {!compact && <th className="pb-2 text-right font-normal">게임</th>}
          <th className="pb-2 text-right font-normal">승률</th>
          <th className="pb-2 pr-2 text-right font-normal">평균 시도</th>
        </tr>
      </thead>
      <tbody>
        {shown.map((row, i) => (
          <tr
            key={row.nickname}
            className="border-t border-border-line/60"
          >
            <td className="py-2.5 pl-2 font-mono">
              {MEDALS[i] ?? `${i + 1}`}
            </td>
            <td className="py-2.5 font-bold">{row.nickname}</td>
            <td className="py-2.5 text-right font-mono text-accent">
              {row.winCnt}
            </td>
            {!compact && (
              <td className="py-2.5 text-right font-mono text-muted">
                {row.gameCnt}
              </td>
            )}
            <td className="py-2.5 text-right font-mono">
              {Math.round(row.winRate * 100)}%
            </td>
            <td className="py-2.5 pr-2 text-right font-mono">
              {row.winTryAvg ?? "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
