import { vi, it, describe, expect, beforeEach } from "vitest";
import { getSocialFeed } from "@/lib/supabase/feed";
import {
  mockSupabaseClient,
  createQueryBuilder,
} from "@/__mocks__/supabase/supabaseClient";

const fromMock = mockSupabaseClient.from as ReturnType<typeof vi.fn>;

describe("getSocialFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns [] immediately without querying when friendIds is empty", async () => {
    const result = await getSocialFeed("me", []);
    expect(result).toEqual([]);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("maps rows to FeedEntry, resolving profile + cafe from array-shaped embeds", async () => {
    const profile = {
      id: "u1",
      username: "alice",
      display_name: "Alice",
      avatar_url: "a.png",
    };
    const rows = [
      {
        id: "l1",
        user_id: "u1",
        cafe_id: "c1",
        created_at: "2026-01-01T00:00:00Z",
        cafes: [{ name: "Blue Bottle" }],
        profiles: [profile],
      },
    ];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await getSocialFeed("me", ["u1"]);

    expect(fromMock).toHaveBeenCalledWith("likes");
    expect(builder.in).toHaveBeenCalledWith("user_id", ["u1"]);
    expect(result).toEqual([
      {
        id: "l1",
        user_id: "u1",
        cafe_id: "c1",
        cafe_name: "Blue Bottle",
        created_at: "2026-01-01T00:00:00Z",
        profile,
      },
    ]);
  });

  it("resolves profile + cafe from object-shaped (to-one) embeds", async () => {
    const profile = {
      id: "u2",
      username: "bob",
      display_name: "Bob",
      avatar_url: "b.png",
    };
    const rows = [
      {
        id: "l9",
        user_id: "u2",
        cafe_id: "c9",
        created_at: "2026-04-01T00:00:00Z",
        cafes: { name: "Stumptown" },
        profiles: profile,
      },
    ];
    fromMock.mockReturnValue(createQueryBuilder({ data: rows, error: null }));

    const [entry] = await getSocialFeed("me", ["u2"]);

    expect(entry.cafe_name).toBe("Stumptown");
    expect(entry.profile).toEqual(profile);
  });

  it("falls back to 'Unknown cafe' when cafes is missing/empty", async () => {
    const rows = [
      {
        id: "l2",
        user_id: "u2",
        cafe_id: "c2",
        created_at: "2026-02-01T00:00:00Z",
        cafes: null,
      },
      {
        id: "l3",
        user_id: "u3",
        cafe_id: "c3",
        created_at: "2026-03-01T00:00:00Z",
        cafes: [],
      },
    ];
    fromMock.mockReturnValue(createQueryBuilder({ data: rows, error: null }));

    const result = await getSocialFeed("me", ["u2", "u3"]);

    expect(result.map((r) => r.cafe_name)).toEqual([
      "Unknown cafe",
      "Unknown cafe",
    ]);
  });

  it("passes the limit param through to the query builder", async () => {
    const builder = createQueryBuilder({ data: [], error: null });
    fromMock.mockReturnValue(builder);

    await getSocialFeed("me", ["u1"], 10);

    expect(builder.limit).toHaveBeenCalledWith(10);
  });

  it("returns [] when data is null", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await getSocialFeed("me", ["u1"])).toEqual([]);
  });
});
