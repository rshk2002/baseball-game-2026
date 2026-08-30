import Link from "next/link";
import RankingTable from "@/components/RankingTable";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="mt-6 text-center">
        <p className="text-6xl">⚾</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">숫자야구 2026</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          컴퓨터가 숨긴 <b className="text-foreground">중복 없는 3자리 숫자</b>를
          추리하세요. 숫자와 위치가 맞으면 스트라이크, 숫자만 맞으면 볼!
        </p>
        <Link
          href="/play"
          className="mt-6 inline-block rounded-2xl bg-accent px-10 py-4 text-lg font-bold text-background transition hover:brightness-110 active:scale-95"
        >
          플레이 볼! →
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-line bg-surface p-4 text-center">
          <p className="font-mono text-2xl font-bold text-strike">S</p>
          <p className="mt-1 text-sm font-bold">스트라이크</p>
          <p className="mt-1 text-xs text-muted">숫자와 위치 모두 일치</p>
        </div>
        <div className="rounded-2xl border border-border-line bg-surface p-4 text-center">
          <p className="font-mono text-2xl font-bold text-ball">B</p>
          <p className="mt-1 text-sm font-bold">볼</p>
          <p className="mt-1 text-xs text-muted">숫자는 있지만 위치가 다름</p>
        </div>
        <div className="rounded-2xl border border-border-line bg-surface p-4 text-center">
          <p className="font-mono text-2xl font-bold text-out">O</p>
          <p className="mt-1 text-sm font-bold">아웃</p>
          <p className="mt-1 text-xs text-muted">정답에 없는 숫자</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border-line bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">🏆 명예의 전당</h2>
          <Link
            href="/ranking"
            className="text-sm text-muted transition hover:text-foreground"
          >
            전체 랭킹 →
          </Link>
        </div>
        <RankingTable sort="wins" limit={3} compact />
      </section>
    </div>
  );
}
