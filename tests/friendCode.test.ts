import { describe, it, expect } from "vitest";

// Mirrors the display formatting used in Settings and Profile pages
function formatFriendCode(code: string): string {
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

function isValidFriendCode(code: string): boolean {
  return /^[A-Z0-9]{7}$/.test(code);
}

describe("friend code formatting", () => {
  it("formats a 7-char code as XXX-XXXX", () => {
    expect(formatFriendCode("X7K29QA")).toBe("X7K-29QA");
  });

  it("validates correct format", () => {
    expect(isValidFriendCode("ABC1234")).toBe(true);
    expect(isValidFriendCode("X7K29QA")).toBe(true);
  });

  it("rejects lowercase", () => {
    expect(isValidFriendCode("abc1234")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(isValidFriendCode("ABC123")).toBe(false);
    expect(isValidFriendCode("ABC12345")).toBe(false);
  });

  it("rejects special characters", () => {
    expect(isValidFriendCode("ABC-123")).toBe(false);
  });
});
