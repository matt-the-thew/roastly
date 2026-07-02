import { vi, it, describe, expect, beforeEach } from "vitest";
import * as friends from "@/lib/supabase/friends";
import {
  mockSupabaseClient,
  createQueryBuilder,
} from "@/__mocks__/supabase/supabaseClient";

const fromMock = mockSupabaseClient.from as ReturnType<typeof vi.fn>;

describe("getFriends", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("flattens sent + received rows into one Profile[] and drops null profiles", async () => {
    const sentBuilder = createQueryBuilder({
      data: [
        { addressee_id: "a1", profiles: { id: "p1", username: "alice" } },
        { addressee_id: "a2", profiles: null },
      ],
      error: null,
    });
    const receivedBuilder = createQueryBuilder({
      data: [
        { requester_id: "r1", profiles: { id: "p2", username: "bob" } },
        { requester_id: "r2", profiles: null },
      ],
      error: null,
    });
    // First from() call => sent query, second => received query
    fromMock
      .mockReturnValueOnce(sentBuilder)
      .mockReturnValueOnce(receivedBuilder);

    const result = await friends.getFriends("me");

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(result.map((p) => p.username)).toEqual(["alice", "bob"]);
  });

  it("returns [] when both queries return null data", async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: null }),
    );
    const result = await friends.getFriends("me");
    expect(result).toEqual([]);
  });
});

describe("getFriendIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a Set of friend ids", async () => {
    fromMock
      .mockReturnValueOnce(
        createQueryBuilder({
          data: [{ profiles: { id: "p1" } }, { profiles: { id: "p2" } }],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        createQueryBuilder({
          data: [{ profiles: { id: "p3" } }],
          error: null,
        }),
      );

    const ids = await friends.getFriendIds("me");
    expect(ids).toBeInstanceOf(Set);
    expect([...ids].sort()).toEqual(["p1", "p2", "p3"]);
    expect(ids.has("p2")).toBe(true);
    expect(ids.has("nope")).toBe(false);
  });
});

describe("getIncomingRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries friendships filtered to addressee/pending and returns data", async () => {
    const rows = [{ id: "f1", addressee_id: "me", status: "pending" }];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await friends.getIncomingRequests("me");

    expect(fromMock).toHaveBeenCalledWith("friendships");
    expect(builder.eq).toHaveBeenCalledWith("addressee_id", "me");
    expect(builder.eq).toHaveBeenCalledWith("status", "pending");
    expect(builder.gt).toHaveBeenCalledWith(
      "expires_at",
      expect.any(String),
    );
    expect(result).toEqual(rows);
  });

  it("returns [] when data is null", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await friends.getIncomingRequests("me")).toEqual([]);
  });
});

describe("getOutgoingRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries friendships filtered to requester/pending and returns data", async () => {
    const rows = [{ id: "f2", requester_id: "me", status: "pending" }];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await friends.getOutgoingRequests("me");

    expect(fromMock).toHaveBeenCalledWith("friendships");
    expect(builder.eq).toHaveBeenCalledWith("requester_id", "me");
    expect(builder.eq).toHaveBeenCalledWith("status", "pending");
    expect(result).toEqual(rows);
  });

  it("returns [] when data is null", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await friends.getOutgoingRequests("me")).toEqual([]);
  });
});

describe("getFriendship", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the row via maybeSingle when present", async () => {
    const row = { id: "f3", requester_id: "me", addressee_id: "other" };
    const builder = createQueryBuilder({ data: row, error: null });
    fromMock.mockReturnValue(builder);

    const result = await friends.getFriendship("me", "other");

    expect(fromMock).toHaveBeenCalledWith("friendships");
    expect(builder.or).toHaveBeenCalled();
    expect(builder.maybeSingle).toHaveBeenCalled();
    expect(result).toEqual(row);
  });

  it("returns null when no row", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await friends.getFriendship("me", "other")).toBeNull();
  });
});

describe("sendFriendRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts the requester/addressee pair", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(builder);

    await friends.sendFriendRequest("me", "other");

    expect(fromMock).toHaveBeenCalledWith("friendships");
    expect(builder.insert).toHaveBeenCalledWith({
      requester_id: "me",
      addressee_id: "other",
    });
  });

  it("throws when the insert returns an error", async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "dupe" } }),
    );
    await expect(friends.sendFriendRequest("me", "other")).rejects.toThrow(
      "dupe",
    );
  });
});

describe("respondToRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates status and filters by friendship id", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(builder);

    await friends.respondToRequest("f1", "accepted");

    expect(fromMock).toHaveBeenCalledWith("friendships");
    expect(builder.update).toHaveBeenCalledWith({ status: "accepted" });
    expect(builder.eq).toHaveBeenCalledWith("id", "f1");
  });

  it("throws when update returns an error", async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "denied" } }),
    );
    await expect(friends.respondToRequest("f1", "denied")).rejects.toThrow(
      "denied",
    );
  });
});

describe("removeFriend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes via an or-filter over both directions", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(builder);

    await friends.removeFriend("me", "other");

    expect(fromMock).toHaveBeenCalledWith("friendships");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.or).toHaveBeenCalledWith(
      expect.stringContaining("requester_id.eq.me"),
    );
  });

  it("throws when delete returns an error", async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "boom" } }),
    );
    await expect(friends.removeFriend("me", "other")).rejects.toThrow("boom");
  });
});

describe("getMutualFriends", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the intersection of both users' friends by id", async () => {
    // getFriends(userId): 2 from() calls; getFriends(otherId): 2 from() calls.
    // My friends: p1, p2, p3
    fromMock
      .mockReturnValueOnce(
        createQueryBuilder({
          data: [{ profiles: { id: "p1", username: "a" } }],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        createQueryBuilder({
          data: [
            { profiles: { id: "p2", username: "b" } },
            { profiles: { id: "p3", username: "c" } },
          ],
          error: null,
        }),
      )
      // Their friends: p2, p4
      .mockReturnValueOnce(
        createQueryBuilder({
          data: [{ profiles: { id: "p2", username: "b" } }],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        createQueryBuilder({
          data: [{ profiles: { id: "p4", username: "d" } }],
          error: null,
        }),
      );

    const result = await friends.getMutualFriends("me", "other");
    expect(result.map((p) => p.id)).toEqual(["p2"]);
  });
});
