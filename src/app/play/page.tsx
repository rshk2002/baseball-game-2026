"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Confetti from "@/components/Confetti";
import { ANSWER_LENGTH, validateNickname } from "@/lib/game";

type HistoryItem = {
  guess: string;
  strike: number;
  ball: number;
  out: number;
};

type Phase = "nickname" | "playing" | "done";

const ERROR_MESSAGES: Record<string, string> = {
  EMPTY: "닉네임을 입력해주세요.",
  TOO_LONG: "닉네임은 12자 이내로 입력해주세요.",
  INVALID_CHAR: "닉네임은 한글/영문/숫자만 사용할 수 있어요.",
  INVALID_LENGTH: "숫자 3자리를 입력해주세요.",
  NOT_A_NUMBER: "숫자만 입력할 수 있어요.",
  DUPLICATE_DIGIT: "같은 숫자는 두 번 쓸 수 없어요.",
  GAME_NOT_FOUND: "게임을 찾을 수 없어요. 새 게임을 시작해주세요.",
  GAME_ALREADY_ENDED: "이미 끝난 게임이에요. 새 게임을 시작해주세요.",
  RATE_LIMITED: "요청이 너무 많아요. 잠시 후 다시 시도해주세요.",
};

function errorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? "오류가 발생했어요. 잠시 후 다시 시도해주세요.";
}

export default function PlayPage() {
  const [phase, setPhase] = useState<Phase>("nickname");
  const [nickname, setNickname] = useState("");
  const [gameId, setGameId] = useState("");
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [result, setResult] = useState<{
    status: "WIN" | "GIVE_UP";
    answer: string;
    tryCount: number;
    seconds: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nickname");
      // SSR과 첫 클라이언트 렌더가 일치해야 하므로 lazy init 대신 effect에서 채운다
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setNickname(saved);
    } catch {
      // localStorage 접근 불가 환경은 무시
    }
  }, []);

  async function startGame() {
    const validation = validateNickname(nickname);
    if (!validation.ok) {
      setError(errorMessage(validation.error));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: validation.nickname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(errorMessage(data.error));
        return;
      }
      try {
        localStorage.setItem("nickname", validation.nickname);
      } catch {
        // 무시
      }
      setGameId(data.gameId);
      setHistory([]);
      setGuess("");
      setResult(null);
      startTimeRef.current = Date.now();
      setPhase("playing");
    } catch {
      setError("서버에 연결할 수 없어요.");
    } finally {
      setLoading(false);
    }
  }

  function pressDigit(digit: string) {
    setError("");
    if (guess.length >= ANSWER_LENGTH || guess.includes(digit)) return;
    setGuess(guess + digit);
  }

  function pressBackspace() {
    setError("");
    setGuess(guess.slice(0, -1));
  }

  async function submitGuess() {
    if (guess.length !== ANSWER_LENGTH || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/game/${gameId}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(errorMessage(data.error));
        return;
      }
      setHistory((prev) => [
        { guess, strike: data.strike, ball: data.ball, out: data.out },
        ...prev,
      ]);
      setGuess("");
      if (data.status === "WIN") {
        setResult({
          status: "WIN",
          answer: data.answer,
          tryCount: data.tryCount,
          seconds: Math.round((Date.now() - startTimeRef.current) / 1000),
        });
        setPhase("done");
      }
    } catch {
      setError("서버에 연결할 수 없어요.");
    } finally {
      setLoading(false);
    }
  }

  async function giveUp() {
    setConfirmingGiveUp(false);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/game/${gameId}/giveup`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(errorMessage(data.error));
        return;
      }
      setResult({
        status: "GIVE_UP",
        answer: data.answer,
        tryCount: history.length,
        seconds: Math.round((Date.now() - startTimeRef.current) / 1000),
      });
      setPhase("done");
    } catch {
      setError("서버에 연결할 수 없어요.");
    } finally {
      setLoading(false);
    }
  }

  // 키보드 입력 지원 (데스크톱)
  useEffect(() => {
    if (phase !== "playing") return;
    function onKeyDown(e: KeyboardEvent) {
      if (/^[0-9]$/.test(e.key)) pressDigit(e.key);
      else if (e.key === "Backspace") pressBackspace();
      else if (e.key === "Enter") submitGuess();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, guess, loading, gameId]);

  return (
    <div className="flex flex-col gap-6">
      {phase === "nickname" && (
        <section className="mx-auto mt-8 w-full max-w-sm rounded-2xl border border-border-line bg-surface p-6 pop-in">
          <h1 className="text-xl font-bold">🎮 게임 시작</h1>
          <p className="mt-1 text-sm text-muted">
            랭킹에 기록될 닉네임을 입력해주세요.
          </p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startGame()}
            placeholder="예: 야구왕123"
            maxLength={12}
            className="mt-4 w-full rounded-xl border border-border-line bg-background px-4 py-3 outline-none transition focus:border-accent"
          />
          <button
            onClick={startGame}
            disabled={loading || !nickname.trim()}
            className="mt-3 w-full rounded-xl bg-accent px-4 py-3 font-bold text-background transition hover:brightness-110 disabled:opacity-40"
          >
            {loading ? "준비 중..." : "플레이 볼! ⚾"}
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </section>
      )}

      {phase !== "nickname" && (
        <>
          {/* 전광판 헤더 */}
          <section className="flex items-center justify-between rounded-2xl border border-border-line bg-surface px-5 py-3">
            <div className="text-sm">
              <span className="text-muted">타자</span>{" "}
              <span className="font-bold">{nickname}</span>
            </div>
            <div className="font-mono text-sm text-accent">
              {history.length} 회 시도
            </div>
          </section>

          {/* 현재 입력 */}
          <section className="rounded-2xl border border-border-line bg-surface p-5">
            <div className="flex justify-center gap-3">
              {Array.from({ length: ANSWER_LENGTH }, (_, i) => (
                <div
                  key={i}
                  className={`flex h-16 w-14 items-center justify-center rounded-xl border-2 font-mono text-3xl font-bold ${
                    guess[i]
                      ? "border-accent text-accent"
                      : "border-border-line text-muted"
                  }`}
                >
                  {guess[i] ?? "·"}
                </div>
              ))}
            </div>
            {error && (
              <p className="mt-3 text-center text-sm text-red-400">{error}</p>
            )}

            {phase === "playing" && (
              <>
                {/* 숫자 키패드 */}
                <div className="mx-auto mt-5 grid max-w-xs grid-cols-5 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map(
                    (d) => (
                      <button
                        key={d}
                        onClick={() => pressDigit(d)}
                        disabled={
                          guess.includes(d) || guess.length >= ANSWER_LENGTH
                        }
                        className="h-12 rounded-xl border border-border-line bg-surface-raised font-mono text-lg font-bold transition hover:border-accent active:scale-95 disabled:opacity-30"
                      >
                        {d}
                      </button>
                    )
                  )}
                </div>
                <div className="mx-auto mt-2 grid max-w-xs grid-cols-2 gap-2">
                  <button
                    onClick={pressBackspace}
                    disabled={guess.length === 0}
                    className="h-12 rounded-xl border border-border-line bg-surface-raised font-bold transition active:scale-95 disabled:opacity-30"
                  >
                    ⌫ 지우기
                  </button>
                  <button
                    onClick={submitGuess}
                    disabled={guess.length !== ANSWER_LENGTH || loading}
                    className="h-12 rounded-xl bg-accent font-bold text-background transition hover:brightness-110 active:scale-95 disabled:opacity-40"
                  >
                    타격! ⚾
                  </button>
                </div>
              </>
            )}
          </section>

          {/* 시도 내역 */}
          {history.length > 0 && (
            <section className="rounded-2xl border border-border-line bg-surface p-5">
              <h2 className="mb-3 text-sm font-bold text-muted">시도 내역</h2>
              <ul className="flex flex-col gap-2">
                {history.map((item, i) => (
                  <li
                    key={history.length - i}
                    className="flex items-center justify-between rounded-xl bg-background px-4 py-2.5 pop-in"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 font-mono text-xs text-muted">
                        #{history.length - i}
                      </span>
                      <span className="font-mono text-xl font-bold tracking-widest">
                        {item.guess}
                      </span>
                    </div>
                    <div className="flex gap-1.5 font-mono text-sm font-bold">
                      {item.strike > 0 && (
                        <span className="rounded-md bg-strike/15 px-2 py-0.5 text-strike">
                          {item.strike}S
                        </span>
                      )}
                      {item.ball > 0 && (
                        <span className="rounded-md bg-ball/15 px-2 py-0.5 text-ball">
                          {item.ball}B
                        </span>
                      )}
                      {item.strike === 0 && item.ball === 0 && (
                        <span className="rounded-md bg-out/15 px-2 py-0.5 text-out">
                          OUT
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {phase === "playing" &&
            (confirmingGiveUp ? (
              <div className="mx-auto flex items-center gap-3 rounded-xl border border-border-line bg-surface px-4 py-2.5 text-sm pop-in">
                <span className="text-muted">
                  정답이 공개되고 기록에 남아요.
                </span>
                <button
                  onClick={giveUp}
                  disabled={loading}
                  className="font-bold text-red-400 transition hover:brightness-110"
                >
                  정말 포기
                </button>
                <button
                  onClick={() => setConfirmingGiveUp(false)}
                  className="font-bold text-strike transition hover:brightness-110"
                >
                  계속하기
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingGiveUp(true)}
                disabled={loading}
                className="mx-auto text-sm text-muted underline-offset-4 transition hover:text-red-400 hover:underline"
              >
                포기하고 정답 보기
              </button>
            ))}
        </>
      )}

      {/* 결과 오버레이 */}
      {phase === "done" && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          {result.status === "WIN" && <Confetti />}
          <div className="w-full max-w-sm rounded-2xl border border-border-line bg-surface p-6 text-center pop-in">
            <p className="text-4xl">
              {result.status === "WIN" ? "🎉" : "😢"}
            </p>
            <h2 className="mt-2 text-xl font-bold">
              {result.status === "WIN" ? "홈런! 정답입니다!" : "게임 포기"}
            </h2>
            <p className="mt-4 text-sm text-muted">정답</p>
            <p className="font-mono text-4xl font-bold tracking-widest text-accent">
              {result.answer}
            </p>
            {result.status === "WIN" && (
              <p className="mt-3 text-sm text-muted">
                {result.tryCount}번 만에 · {result.seconds}초 소요
              </p>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={startGame}
                disabled={loading}
                className="flex-1 rounded-xl bg-accent px-4 py-3 font-bold text-background transition hover:brightness-110 disabled:opacity-40"
              >
                다시하기
              </button>
              <Link
                href="/ranking"
                className="flex-1 rounded-xl border border-border-line px-4 py-3 font-bold transition hover:bg-surface-raised"
              >
                랭킹 보기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
