import Link from "next/link";

export const metadata = { title: "게임 규칙 — 숫자야구 2026" };

export default function InstructionPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">📖 게임 규칙</h1>

      <section className="rounded-2xl border border-border-line bg-surface p-6 leading-relaxed">
        <p>
          컴퓨터가 <b>0~9 중 중복 없는 숫자 3자리</b>를 숨겼습니다. 여러분은
          타자가 되어 그 숫자를 추리합니다.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          <li>
            <span className="mr-2 rounded-md bg-strike/15 px-2 py-0.5 font-mono font-bold text-strike">
              STRIKE
            </span>
            숫자와 위치가 모두 맞았어요
          </li>
          <li>
            <span className="mr-2 rounded-md bg-ball/15 px-2 py-0.5 font-mono font-bold text-ball">
              BALL
            </span>
            숫자는 맞지만 위치가 달라요
          </li>
          <li>
            <span className="mr-2 rounded-md bg-out/15 px-2 py-0.5 font-mono font-bold text-out">
              OUT
            </span>
            정답에 없는 숫자예요
          </li>
        </ul>
        <p className="mt-4">
          <b className="text-accent">3 스트라이크</b>가 되면 승리! 시도 횟수
          제한은 없지만, 적게 시도할수록 랭킹에 유리해요.
        </p>
      </section>

      <section className="rounded-2xl border border-border-line bg-surface p-6">
        <h2 className="font-bold">예시</h2>
        <div className="mt-3 flex flex-col gap-3 text-sm">
          <div className="rounded-xl bg-background p-4">
            <p className="text-muted">
              정답이 <b className="font-mono text-foreground">678</b>일 때,{" "}
              <b className="font-mono text-foreground">689</b>를 내면?
            </p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border-line px-4 py-2.5">
              <span className="font-mono text-xl font-bold tracking-widest">
                689
              </span>
              <span className="flex gap-1.5 font-mono font-bold">
                <span className="rounded-md bg-strike/15 px-2 py-0.5 text-strike">
                  1S
                </span>
                <span className="rounded-md bg-ball/15 px-2 py-0.5 text-ball">
                  1B
                </span>
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-1 leading-relaxed text-muted">
              <li>
                <b className="font-mono text-strike">6</b> — 숫자도 있고 위치도
                같아요 →{" "}
                <b className="text-strike">1 STRIKE</b>
              </li>
              <li>
                <b className="font-mono text-ball">8</b> — 숫자는 있지만 위치가
                달라요 → <b className="text-ball">1 BALL</b>
              </li>
              <li>
                <b className="font-mono text-out">9</b> — 정답에 없는 숫자예요
                → <b className="text-out">1 OUT</b>
              </li>
            </ul>
          </div>
          <div className="rounded-xl bg-background p-4">
            <p className="text-muted">
              정답이 <b className="font-mono text-foreground">123</b>일 때,{" "}
              <b className="font-mono text-foreground">023</b>을 내면?
            </p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border-line px-4 py-2.5">
              <span className="font-mono text-xl font-bold tracking-widest">
                023
              </span>
              <span className="flex gap-1.5 font-mono font-bold">
                <span className="rounded-md bg-strike/15 px-2 py-0.5 text-strike">
                  2S
                </span>
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-1 leading-relaxed text-muted">
              <li>
                <b className="font-mono text-strike">2, 3</b> — 둘 다 숫자와
                위치가 같아요 → <b className="text-strike">2 STRIKE</b>
              </li>
              <li>
                <b className="font-mono text-out">0</b> — 정답에 없는 숫자예요
                → <b className="text-out">1 OUT</b>
              </li>
            </ul>
          </div>
          <div className="rounded-xl bg-background p-4">
            <p className="text-muted">
              정답이 <b className="font-mono text-foreground">123</b>일 때,{" "}
              <b className="font-mono text-foreground">312</b>를 내면?
            </p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border-line px-4 py-2.5">
              <span className="font-mono text-xl font-bold tracking-widest">
                312
              </span>
              <span className="flex gap-1.5 font-mono font-bold">
                <span className="rounded-md bg-ball/15 px-2 py-0.5 text-ball">
                  3B
                </span>
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-1 leading-relaxed text-muted">
              <li>
                <b className="font-mono text-ball">3, 1, 2</b> — 셋 다 정답에
                있는 숫자지만 위치가 전부 달라요 →{" "}
                <b className="text-ball">3 BALL</b>
              </li>
              <li>
                숫자 구성은 다 맞췄으니, 순서만 바꾸면 정답이에요!
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border-line bg-surface p-6 text-sm text-muted">
        <h2 className="font-bold text-foreground">팁</h2>
        <ul className="mt-2 list-inside list-disc leading-relaxed">
          <li>같은 숫자는 두 번 쓸 수 없어요 (정답에도 중복이 없어요)</li>
          <li>OUT이 나온 숫자를 지워가며 후보를 좁혀보세요</li>
          <li>도저히 모르겠다면 포기하고 정답을 볼 수 있지만, 기록에 남아요</li>
        </ul>
      </section>

      <Link
        href="/play"
        className="mx-auto rounded-2xl bg-accent px-10 py-4 text-lg font-bold text-background transition hover:brightness-110 active:scale-95"
      >
        플레이 볼! →
      </Link>
    </div>
  );
}
