import { describe, it, expect } from "vitest";
import { getInitials, getAvatarColor } from "@/lib/supabase/profile";

describe("getInitials", () => {
  it("returns initials from two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial from one-word name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("uses only the first two words", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("handles empty string", () => {
    expect(getInitials("")).toBe("");
  });

  it("uppercases initials", () => {
    expect(getInitials("jane doe")).toBe("JD");
  });

  it("handles extra spaces gracefully", () => {
    expect(getInitials("  Jane   Doe  ")).toBe("JD");
  });
});

describe("getAvatarColor", () => {
  it("returns a hex color string", () => {
    const color = getAvatarColor("alice");
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("is deterministic for the same seed", () => {
    expect(getAvatarColor("testuser")).toBe(getAvatarColor("testuser"));
  });

  it("returns different colors for different seeds", () => {
    const colors = new Set(
      ["alice", "bob", "carol", "dave", "eve", "frank", "grace", "henry", "iris"].map(
        getAvatarColor,
      ),
    );
    // With 8 colors and 9 seeds some collisions are possible, but not all should match
    expect(colors.size).toBeGreaterThan(1);
  });
});
