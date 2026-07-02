import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getInitials,
  getAvatarColor,
  getProfile,
  getProfileByUsername,
  getProfileByFriendCode,
  createProfile,
  updateProfile,
  isUsernameAvailable,
} from "@/lib/supabase/profile";
import {
  mockSupabaseClient,
  createQueryBuilder,
} from "@/__mocks__/supabase/supabaseClient";

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

describe("getProfileByUsername", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries profiles by username and returns the row", async () => {
    const builder = createQueryBuilder({
      data: { id: "p1", username: "alice" },
      error: null,
    });
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      builder,
    );

    const result = await getProfileByUsername("alice");

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("profiles");
    expect(builder.eq).toHaveBeenCalledWith("username", "alice");
    expect(result).toEqual({ id: "p1", username: "alice" });
  });

  it("returns null when no row is found", async () => {
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      createQueryBuilder({ data: null, error: null }),
    );
    const result = await getProfileByUsername("ghost");
    expect(result).toBeNull();
  });
});

describe("getProfileByFriendCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uppercases the friend code before querying", async () => {
    const builder = createQueryBuilder({
      data: { id: "p2", friend_code: "X7K29QA" },
      error: null,
    });
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      builder,
    );

    const result = await getProfileByFriendCode("x7k29qa");

    expect(builder.eq).toHaveBeenCalledWith("friend_code", "X7K29QA");
    expect(result).toEqual({ id: "p2", friend_code: "X7K29QA" });
  });

  it("returns null when no profile matches the friend code", async () => {
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      createQueryBuilder({ data: null, error: null }),
    );
    const result = await getProfileByFriendCode("zzzzzzz");
    expect(result).toBeNull();
  });
});

describe("createProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts a profile and returns the created row", async () => {
    const created = { id: "u1", username: "bob", display_name: "Bob" };
    const builder = createQueryBuilder({ data: created, error: null });
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      builder,
    );

    const result = await createProfile("u1", "bob", "Bob", "hi", "url");

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("profiles");
    expect(builder.insert).toHaveBeenCalledWith({
      id: "u1",
      username: "bob",
      display_name: "Bob",
      bio: "hi",
      avatar_url: "url",
    });
    expect(result).toEqual(created);
  });

  it("throws when the insert errors", async () => {
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "duplicate key" } }),
    );

    await expect(createProfile("u1", "bob", "Bob")).rejects.toThrow(
      "duplicate key",
    );
  });
});

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the profile row scoped to the user id", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      builder,
    );

    await expect(
      updateProfile("u1", { bio: "new bio", is_private: true }),
    ).resolves.toBeUndefined();

    expect(builder.update).toHaveBeenCalledWith({
      bio: "new bio",
      is_private: true,
    });
    expect(builder.eq).toHaveBeenCalledWith("id", "u1");
  });

  it("throws when the update errors", async () => {
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "rls denied" } }),
    );

    await expect(updateProfile("u1", { bio: "x" })).rejects.toThrow(
      "rls denied",
    );
  });
});

describe("isUsernameAvailable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when no matching row exists", async () => {
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      createQueryBuilder({ data: null, error: null }),
    );
    await expect(isUsernameAvailable("freeuser")).resolves.toBe(true);
  });

  it("returns false when a matching row exists", async () => {
    const builder = createQueryBuilder({ data: { id: "u9" }, error: null });
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      builder,
    );

    const result = await isUsernameAvailable("taken");

    expect(builder.eq).toHaveBeenCalledWith("username", "taken");
    expect(result).toBe(false);
  });
});
