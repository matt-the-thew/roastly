import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getInitials,
  getAvatarColor,
  getProfile,
} from "@/lib/supabase/profile";
import { mockSupabaseClient } from "@/__mocks__/supabase/supabaseClient";

describe("getInitials", () => {
  it("returns initials from two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Mary Jane")).toBe("MJ");
  });

  it("returns single initial from one-word name", () => {
    expect(getInitials("Alice")).toBe("A");
    expect(getInitials("Jeremy")).toBe("J");
  });

  it("uses only the first two words", () => {
    expect(getInitials("John Michael Doe")).toBe("JD");
    expect(getInitials("Terrence Dirk Flannigan")).toBe("TF");
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
      [
        "alice",
        "bob",
        "carol",
        "dave",
        "eve",
        "frank",
        "grace",
        "henry",
        "iris",
      ].map(getAvatarColor),
    );
    // With 8 colors and 9 seeds some collisions are possible, but not all should match
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe("getProfile", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tries to pull data from DB", async () => {
    await getProfile("test_user_id");
    expect(mockSupabaseClient.from).toHaveBeenCalled();
  });

  it("passes accurate query information", async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: "test_data" }, error: null }),
    };

    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      mockChain,
    );

    await getProfile("test_user_id");

    const fromSpy = vi.spyOn(mockSupabaseClient, "from");
    // should call from("profiles")
    expect(fromSpy).toHaveBeenCalledWith("profiles");
    // should call select("*")
    expect(mockChain.select).toHaveBeenCalledWith("*");
    // should call eq("id", user_id)
    expect(mockChain.eq).toHaveBeenCalledWith("id", "test_user_id");
  });

  it("should recieve correct data", async () => {
    const result = await getProfile("test_user_id");
    // should get a result
    expect(result).toBeDefined();
    // result should pass correct data
    expect(result).toEqual({ id: "test_data" });
  });
});
