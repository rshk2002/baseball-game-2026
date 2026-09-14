"use client";

/**
 * 투구 연출 스테이지 (순수 CSS 애니메이션 + 인라인 SVG)
 *
 * 사용자는 투수, 컴퓨터는 심판. 상태 전환은 부모(play 페이지)가 담당하고
 * 이 컴포넌트는 상태에 맞는 클래스를 붙여 CSS keyframes를 재생하기만 한다.
 *
 *  idle      대기 (세트 포지션)
 *  throw     와인드업 → 릴리스 → 공이 미트로 (450ms)
 *  caught    공이 미트에 들어간 채 정지. 판정 응답 대기
 *  strike    스트라이크 1~2개: 심판 펀치
 *  strikeout 3 스트라이크(정답): 펀치 + 플래시
 *  ballcall  스트라이크 0, 볼 1+: 심판이 팔을 옆으로
 *  nothing   낫싱(0S 0B): 콜 없이 공이 미트에서 흘러 굴러감
 */
export type PitchState =
  "idle" | "throw" | "caught" | "strike" | "strikeout" | "ballcall" | "nothing";

export type PitchResult = { strike: number; ball: number };

/** 판정 결과 → 연출 상태 */
export function pitchStateFor(
  result: PitchResult,
  answerLength: number,
): PitchState {
  if (result.strike === answerLength) return "strikeout";
  if (result.strike > 0) return "strike";
  if (result.ball > 0) return "ballcall";
  return "nothing";
}

const CALL_STATES: ReadonlySet<PitchState> = new Set([
  "strike",
  "strikeout",
  "ballcall",
  "nothing",
]);

type Props = {
  state: PitchState;
  /** 심판 콜 말풍선에 표시할 결과. 콜 상태가 아닐 때는 무시 */
  result: PitchResult | null;
};

export default function PitchStage({ state, result }: Props) {
  const showCall = CALL_STATES.has(state) && result !== null;

  return (
    <div
      className={`pitch-stage is-${state} relative h-28 overflow-hidden rounded-xl border border-border-line bg-background sm:h-32`}
      aria-hidden
    >
      <div className="ps-flash pointer-events-none absolute inset-0 bg-accent" />
      {/* 장면은 항상 5:2 비율로 가운데 정렬. 카드가 더 넓으면 좌우는 CSS 그라운드로 채워짐 */}
      <div className="relative mx-auto aspect-[5/2] h-full">
        <svg
          viewBox="0 0 320 128"
          className="block h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 그라운드 */}
          <rect x="0" y="100" width="320" height="28" fill="#0f2a1e" />
          <line
            x1="0"
            y1="100"
            x2="320"
            y2="100"
            stroke="#1f4a36"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="112"
            x2="320"
            y2="112"
            stroke="#163a2a"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          {/* 마운드 + 투수판 */}
          <ellipse cx="52" cy="100" rx="30" ry="5" fill="#3a2a17" />
          <rect
            x="46"
            y="96"
            width="12"
            height="2.5"
            rx="1"
            fill="var(--foreground)"
            opacity=".9"
          />
          {/* 홈플레이트 */}
          <path
            d="M240 104 h16 l-3 8 h-10 z"
            fill="var(--foreground)"
            opacity=".9"
          />

          {/* 투구 잔상 */}
          <path
            className="ps-trail"
            d="M80 33 Q165 36 250 55"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 7"
          />

          {/* 투수 (사용자) */}
          <g className="ps-pitcher">
            <path
              d="M49 72 L38 100"
              stroke="var(--foreground)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M55 72 L66 100"
              stroke="var(--foreground)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M46 40 h12 a4 4 0 0 1 4 4 v26 a4 4 0 0 1 -4 4 h-12 a4 4 0 0 1 -4 -4 v-26 a4 4 0 0 1 4 -4z"
              fill="var(--foreground)"
            />
            <text
              x="52"
              y="61"
              fontFamily="var(--font-geist-mono), monospace"
              fontSize="10"
              fontWeight="700"
              fill="var(--accent)"
              textAnchor="middle"
            >
              26
            </text>
            <circle cx="52" cy="29" r="9" fill="var(--foreground)" />
            <path
              d="M43 27 a9 9 0 0 1 18 0 h5 v3 h-23z"
              fill="var(--surface-raised)"
            />
            {/* 글러브 팔 */}
            <path
              d="M48 46 L36 56"
              stroke="var(--foreground)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="34" cy="58" r="5" fill="#b97a12" />
            {/* 던지는 팔: 어깨(56,46) 기준 회전 */}
            <g className="ps-arm">
              <path
                d="M56 46 L62 26"
                stroke="var(--foreground)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle
                className="ps-handball"
                cx="63"
                cy="23"
                r="4.5"
                fill="#f8fafc"
              />
            </g>
          </g>

          {/* 포수 (컴퓨터) */}
          <g>
            <path
              d="M268 88 L258 100"
              stroke="var(--foreground)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M282 88 L290 100"
              stroke="var(--foreground)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M266 66 h18 a4 4 0 0 1 4 4 v18 a4 4 0 0 1 -4 4 h-18 a4 4 0 0 1 -4 -4 v-18 a4 4 0 0 1 4 -4z"
              fill="var(--foreground)"
            />
            <circle cx="275" cy="58" r="8" fill="var(--foreground)" />
            <path
              d="M267 58 a8 8 0 0 1 16 0 v2 h-16z"
              fill="var(--surface-raised)"
            />
            <path
              d="M268 72 L260 62"
              stroke="var(--foreground)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* 미트 */}
            <circle
              cx="256"
              cy="56"
              r="7.5"
              fill="#b97a12"
              stroke="#7a4e0a"
              strokeWidth="1.5"
            />
            <path
              d="M252 53 q4 3 8 0"
              stroke="#7a4e0a"
              strokeWidth="1.2"
              fill="none"
            />
          </g>

          {/* 심판 (컴퓨터) */}
          <g className="ps-umpire">
            <path
              d="M289 80 L287 100"
              stroke="var(--muted)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M296 80 L298 100"
              stroke="var(--muted)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M286 43 h13 a4 4 0 0 1 4 4 v30 a4 4 0 0 1 -4 4 h-13 a4 4 0 0 1 -4 -4 v-30 a4 4 0 0 1 4 -4z"
              fill="var(--muted)"
            />
            <circle cx="292" cy="34" r="8" fill="var(--foreground)" />
            <path d="M284 32 a8 8 0 0 1 16 0 v3 h-16z" fill="var(--border)" />
            <path
              d="M286 48 L282 70"
              stroke="var(--muted)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* 판정 팔: 어깨(298,48) 기준 회전 */}
            <g className="ps-ump-arm">
              <path
                d="M298 48 L300 70"
                stroke="var(--muted)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="300" cy="72" r="3.5" fill="var(--foreground)" />
            </g>
          </g>

          {/* 포구 링 */}
          <circle
            className="ps-pop"
            cx="256"
            cy="56"
            r="7"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
          />

          {/* 날아가는 공 */}
          <g className="ps-ball">
            <circle r="5" fill="#f8fafc" />
            <path
              d="M-2.3 -3.6 q2.8 3.6 0 7.2 M2.3 -3.6 q-2.8 3.6 0 7.2"
              stroke="#ef4444"
              strokeWidth="1"
              fill="none"
            />
          </g>
        </svg>

        {/* 심판 콜 말풍선 */}
        {showCall && (
          <div className="pop-in absolute right-3 top-2.5 flex items-center gap-1.5 font-mono text-sm font-bold">
            {state === "strikeout" ? (
              <span className="rounded-md bg-accent/20 px-2 py-0.5 font-sans text-accent">
                정답입니다!
              </span>
            ) : state === "nothing" ? (
              <span className="rounded-md bg-out/15 px-2 py-0.5 text-out">
                낫싱
              </span>
            ) : (
              <>
                {result.strike > 0 && (
                  <span className="rounded-md bg-strike/15 px-2 py-0.5 text-strike">
                    {result.strike}S
                  </span>
                )}
                {result.ball > 0 && (
                  <span className="rounded-md bg-ball/15 px-2 py-0.5 text-ball">
                    {result.ball}B
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
