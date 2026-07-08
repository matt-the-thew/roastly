import { describe, it, expect } from "vitest";
import {
  validatePassword,
  formatMissingRequirements,
  PASSWORD_MIN_LENGTH,
} from "@/lib/validatePassword";

describe("validatePassword", () => {
  it("accepts a password with all four character classes and sufficient length", () => {
    const result = validatePassword("Str0ng!Pass");
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("flags a missing uppercase letter", () => {
    const result = validatePassword("str0ng!pass");
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("an uppercase letter");
  });

  it("flags a missing lowercase letter", () => {
    const result = validatePassword("STR0NG!PASS");
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("a lowercase letter");
  });

  it("flags a missing number", () => {
    const result = validatePassword("Strong!Pass");
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("a number");
  });

  it("flags a missing symbol", () => {
    const result = validatePassword("Str0ngPass");
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("a symbol");
  });

  it("flags a too-short password with the length requirement", () => {
    const result = validatePassword("Ab1!");
    expect(result.valid).toBe(false);
    expect(result.missing).toContain(`at least ${PASSWORD_MIN_LENGTH} characters`);
  });

  it("does not count a bare space as a symbol", () => {
    const result = validatePassword("Str0ng Pass");
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("a symbol");
  });

  it("lists every unmet requirement for an empty password", () => {
    const result = validatePassword("");
    expect(result.missing).toEqual([
      `at least ${PASSWORD_MIN_LENGTH} characters`,
      "a lowercase letter",
      "an uppercase letter",
      "a number",
      "a symbol",
    ]);
  });
});

describe("formatMissingRequirements", () => {
  it("returns a single item unchanged", () => {
    expect(formatMissingRequirements(["a symbol"])).toBe("a symbol");
  });

  it("joins two items with 'and'", () => {
    expect(formatMissingRequirements(["a number", "a symbol"])).toBe(
      "a number and a symbol",
    );
  });

  it("joins three or more with an Oxford comma", () => {
    expect(
      formatMissingRequirements([
        "an uppercase letter",
        "a number",
        "a symbol",
      ]),
    ).toBe("an uppercase letter, a number, and a symbol");
  });

  it("returns an empty string for an empty list", () => {
    expect(formatMissingRequirements([])).toBe("");
  });
});
