import { describe, it, expect } from "vitest";
import {
  generateAnswer,
  validateGuess,
  judge,
  isWin,
  validateNickname,
} from "./game";

describe("generateAnswer", () => {
  it("중복 없는 3자리 숫자를 생성한다", () => {
    for (let i = 0; i < 100; i++) {
      const answer = generateAnswer();
      expect(answer).toMatch(/^\d{3}$/);
      expect(new Set(answer).size).toBe(3);
    }
  });

  it("첫 자리에 0도 올 수 있다", () => {
    const answers = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      answers.add(generateAnswer()[0]);
    }
    expect(answers.has("0")).toBe(true);
  });
});

describe("validateGuess", () => {
  it("정상 입력을 통과시킨다", () => {
    expect(validateGuess("123")).toEqual({ ok: true, guess: "123" });
    expect(validateGuess(" 087 ")).toEqual({ ok: true, guess: "087" });
  });

  it("숫자가 아니면 거부한다", () => {
    expect(validateGuess("12a")).toEqual({ ok: false, error: "NOT_A_NUMBER" });
    expect(validateGuess("")).toEqual({ ok: false, error: "NOT_A_NUMBER" });
    expect(validateGuess("1 2")).toEqual({ ok: false, error: "NOT_A_NUMBER" });
    expect(validateGuess("-12")).toEqual({ ok: false, error: "NOT_A_NUMBER" });
  });

  it("3자리가 아니면 거부한다", () => {
    expect(validateGuess("12")).toEqual({ ok: false, error: "INVALID_LENGTH" });
    expect(validateGuess("1234")).toEqual({
      ok: false,
      error: "INVALID_LENGTH",
    });
  });

  it("중복 숫자를 거부한다", () => {
    expect(validateGuess("112")).toEqual({
      ok: false,
      error: "DUPLICATE_DIGIT",
    });
    expect(validateGuess("000")).toEqual({
      ok: false,
      error: "DUPLICATE_DIGIT",
    });
  });
});

describe("judge", () => {
  it("3 스트라이크 (정답)", () => {
    expect(judge("123", "123")).toEqual({ strike: 3, ball: 0, out: 0 });
  });

  it("전부 아웃", () => {
    expect(judge("123", "456")).toEqual({ strike: 0, ball: 0, out: 3 });
  });

  it("전부 볼 (숫자는 맞지만 위치가 전부 다름)", () => {
    expect(judge("123", "312")).toEqual({ strike: 0, ball: 3, out: 0 });
  });

  it("1S 1B 1O (기존 규칙 페이지 예시: 정답 678, 시도 689)", () => {
    expect(judge("678", "689")).toEqual({ strike: 1, ball: 1, out: 1 });
  });

  it("2S 1O (기존 규칙 페이지 예시: 정답 123, 시도 023)", () => {
    expect(judge("123", "023")).toEqual({ strike: 2, ball: 0, out: 1 });
  });

  it("1S 2B", () => {
    expect(judge("123", "132")).toEqual({ strike: 1, ball: 2, out: 0 });
  });

  it("2B 1O", () => {
    expect(judge("123", "231")).toEqual({ strike: 0, ball: 3, out: 0 });
    expect(judge("123", "245")).toEqual({ strike: 0, ball: 1, out: 2 });
  });
});

describe("isWin", () => {
  it("3 스트라이크만 승리다", () => {
    expect(isWin({ strike: 3, ball: 0, out: 0 })).toBe(true);
    expect(isWin({ strike: 2, ball: 1, out: 0 })).toBe(false);
    expect(isWin({ strike: 0, ball: 0, out: 3 })).toBe(false);
  });
});

describe("validateNickname", () => {
  it("정상 닉네임을 통과시킨다", () => {
    expect(validateNickname("야구왕123")).toEqual({
      ok: true,
      nickname: "야구왕123",
    });
    expect(validateNickname(" 달리는토끼 ")).toEqual({
      ok: true,
      nickname: "달리는토끼",
    });
    expect(validateNickname("Player1")).toEqual({
      ok: true,
      nickname: "Player1",
    });
  });

  it("빈 닉네임을 거부한다", () => {
    expect(validateNickname("")).toEqual({ ok: false, error: "EMPTY" });
    expect(validateNickname("   ")).toEqual({ ok: false, error: "EMPTY" });
  });

  it("12자 초과를 거부한다", () => {
    expect(validateNickname("a".repeat(13))).toEqual({
      ok: false,
      error: "TOO_LONG",
    });
    expect(validateNickname("a".repeat(12))).toEqual({
      ok: true,
      nickname: "a".repeat(12),
    });
  });

  it("특수문자/공백 포함을 거부한다", () => {
    expect(validateNickname("야구 왕")).toEqual({
      ok: false,
      error: "INVALID_CHAR",
    });
    expect(validateNickname("king!")).toEqual({
      ok: false,
      error: "INVALID_CHAR",
    });
    expect(validateNickname("../etc")).toEqual({
      ok: false,
      error: "INVALID_CHAR",
    });
  });
});
