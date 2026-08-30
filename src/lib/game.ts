/**
 * 숫자야구 게임 코어 로직 (순수 함수)
 *
 * 규칙:
 * - 정답은 0~9 중 중복 없는 숫자 3자리
 * - STRIKE: 숫자와 위치 모두 일치
 * - BALL: 숫자는 있으나 위치가 다름
 * - OUT: 정답에 없는 숫자
 */

export const ANSWER_LENGTH = 3;

export type JudgeResult = {
  strike: number;
  ball: number;
  out: number;
};

export type GameStatus = "IN_PROGRESS" | "WIN" | "GIVE_UP";

/** 중복 없는 3자리 정답 생성 (예: "573") */
export function generateAnswer(): string {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, ANSWER_LENGTH).join("");
}

export type GuessValidation =
  | { ok: true; guess: string }
  | { ok: false; error: "INVALID_LENGTH" | "NOT_A_NUMBER" | "DUPLICATE_DIGIT" };

/** 사용자 입력 검증: 3자리 숫자, 중복 없음 */
export function validateGuess(input: string): GuessValidation {
  const guess = input.trim();
  if (!/^\d+$/.test(guess)) {
    return { ok: false, error: "NOT_A_NUMBER" };
  }
  if (guess.length !== ANSWER_LENGTH) {
    return { ok: false, error: "INVALID_LENGTH" };
  }
  if (new Set(guess).size !== ANSWER_LENGTH) {
    return { ok: false, error: "DUPLICATE_DIGIT" };
  }
  return { ok: true, guess };
}

/** 정답과 시도를 비교해 S/B/O 판정 */
export function judge(answer: string, guess: string): JudgeResult {
  let strike = 0;
  let ball = 0;
  for (let i = 0; i < ANSWER_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      strike++;
    } else if (answer.includes(guess[i])) {
      ball++;
    }
  }
  return { strike, ball, out: ANSWER_LENGTH - strike - ball };
}

/** 승리 여부 */
export function isWin(result: JudgeResult): boolean {
  return result.strike === ANSWER_LENGTH;
}

export type NicknameValidation =
  | { ok: true; nickname: string }
  | { ok: false; error: "EMPTY" | "TOO_LONG" | "INVALID_CHAR" };

export const NICKNAME_MAX_LENGTH = 12;

/** 닉네임 검증: 1~12자, 한글/영문/숫자만 허용 */
export function validateNickname(input: string): NicknameValidation {
  const nickname = input.trim();
  if (nickname.length === 0) {
    return { ok: false, error: "EMPTY" };
  }
  if (nickname.length > NICKNAME_MAX_LENGTH) {
    return { ok: false, error: "TOO_LONG" };
  }
  if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
    return { ok: false, error: "INVALID_CHAR" };
  }
  return { ok: true, nickname };
}
