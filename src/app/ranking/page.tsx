"use client";

import { useState } from "react";
import RankingTable, { RankingSort } from "@/components/RankingTable";

const TABS: { key: RankingSort; label: string; description: string }[] = [
  { key: "wins", label: "다승", description: "정답을 가장 많이 맞춘 순" },
  { key: "winRate", label: "승률", description: "포기하지 않고 맞춘 비율 순" },
  {
    key: "avgTries",
    label: "최소 시도",
    description: "가장 적은 시도로 맞춘 순 (평균)",
  },
];

export default function RankingPage() {
  const [sort, setSort] = useState<RankingSort>("wins");
  const active = TABS.find((t) => t.key === sort)!;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">🏆 랭킹</h1>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSort(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              sort === tab.key
                ? "bg-accent text-background"
                : "border border-border-line bg-surface text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">{active.description}</p>

      <section className="rounded-2xl border border-border-line bg-surface p-5">
        <RankingTable sort={sort} />
      </section>
    </div>
  );
}
