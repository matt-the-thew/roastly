import { vi, it, describe, expect, beforeEach } from "vitest";
import * as likes from "@/lib/supabase/likes";
import {
  mockSupabaseClient,
  createQueryBuilder,
} from "@/__mocks__/supabase/supabaseClient";

const fromMock = mockSupabaseClient.from as ReturnType<typeof vi.fn>;

describe("getLikeCount", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a supabase client", async () => {
    await likes.getLikeCount("test_cafe_id");
    expect(mockSupabaseClient).toBeDefined();
  });

  it("uses count:exact head:true", async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      mockChain,
    );

    const fromSpy = vi.spyOn(mockSupabaseClient, "from");

    await likes.getLikeCount("test_cafe_id");

    expect(fromSpy).toHaveBeenCalled();
    expect(fromSpy).toHaveBeenCalledWith("likes");
    expect(mockChain.select).toHaveBeenCalledWith("id", {
      count: "exact",
      head: true,
    });
    expect(mockChain.eq).toHaveBeenCalledWith("cafe_id", "test_cafe_id");
  });
});

describe("getLikeCounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns {} without querying for empty input", async () => {
    const result = await likes.getLikeCounts([]);
    expect(result).toEqual({});
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("counts rows per cafe_id, zero-initializing all requested ids", async () => {
    const rows = [{ cafe_id: "c1" }, { cafe_id: "c1" }, { cafe_id: "c2" }];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await likes.getLikeCounts(["c1", "c2", "c3"]);

    expect(fromMock).toHaveBeenCalledWith("likes");
    expect(builder.in).toHaveBeenCalledWith("cafe_id", ["c1", "c2", "c3"]);
    expect(result).toEqual({ c1: 2, c2: 1, c3: 0 });
  });

  it("zero-initializes every id when the query returns null data", async () => {
    // Exercises the `data ?? []` null branch: no rows come back, so every
    // requested id stays at its zero baseline.
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    const result = await likes.getLikeCounts(["c1", "c2"]);
    expect(result).toEqual({ c1: 0, c2: 0 });
  });

  it("counts rows whose cafe_id was not among the requested ids", async () => {
    // 'c9' is not requested, so it is not zero-initialized; the loop must
    // fall back to `?? 0` before incrementing it.
    const rows = [{ cafe_id: "c1" }, { cafe_id: "c9" }, { cafe_id: "c9" }];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await likes.getLikeCounts(["c1"]);

    expect(result).toEqual({ c1: 1, c9: 2 });
  });
});

describe("getUserLike", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when a like row exists", async () => {
    const builder = createQueryBuilder({ data: { id: "l1" }, error: null });
    fromMock.mockReturnValue(builder);

    const result = await likes.getUserLike("u1", "c1");

    expect(fromMock).toHaveBeenCalledWith("likes");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(builder.eq).toHaveBeenCalledWith("cafe_id", "c1");
    expect(builder.maybeSingle).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("returns false when no like row exists", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await likes.getUserLike("u1", "c1")).toBe(false);
  });
});

describe("getUserLikedCafeIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps rows to an array of cafe_id", async () => {
    const rows = [{ cafe_id: "c1" }, { cafe_id: "c2" }];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await likes.getUserLikedCafeIds("u1");

    expect(fromMock).toHaveBeenCalledWith("likes");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(result).toEqual(["c1", "c2"]);
  });

  it("returns [] when data is null", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await likes.getUserLikedCafeIds("u1")).toEqual([]);
  });
});

describe("getLikersForCafe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns liker rows for a cafe ordered by created_at", async () => {
    const rows = [
      { id: "l1", user_id: "u1", cafe_id: "c1", created_at: "2026-01-01" },
    ];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await likes.getLikersForCafe("c1");

    expect(fromMock).toHaveBeenCalledWith("likes");
    expect(builder.eq).toHaveBeenCalledWith("cafe_id", "c1");
    expect(builder.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(result).toEqual(rows);
  });

  it("returns [] when data is null", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await likes.getLikersForCafe("c1")).toEqual([]);
  });
});

describe("toggleLike", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the like when currentlyLiked is true", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(builder);

    await likes.toggleLike("u1", "c1", true);

    expect(fromMock).toHaveBeenCalledWith("likes");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.insert).not.toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(builder.eq).toHaveBeenCalledWith("cafe_id", "c1");
  });

  it("inserts the like when currentlyLiked is false", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(builder);

    await likes.toggleLike("u1", "c1", false);

    expect(builder.insert).toHaveBeenCalledWith({
      user_id: "u1",
      cafe_id: "c1",
    });
    expect(builder.delete).not.toHaveBeenCalled();
  });

  it("throws when the delete branch returns an error", async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "del fail" } }),
    );
    await expect(likes.toggleLike("u1", "c1", true)).rejects.toThrow(
      "del fail",
    );
  });

  it("throws when the insert branch returns an error", async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "ins fail" } }),
    );
    await expect(likes.toggleLike("u1", "c1", false)).rejects.toThrow(
      "ins fail",
    );
  });
});
