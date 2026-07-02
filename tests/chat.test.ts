import { vi, it, describe, expect, beforeEach } from "vitest";
import * as chat from "@/lib/supabase/chat";
import {
  mockSupabaseClient,
  createQueryBuilder,
} from "@/__mocks__/supabase/supabaseClient";

const fromMock = mockSupabaseClient.from as ReturnType<typeof vi.fn>;
const rpcMock = mockSupabaseClient.rpc as ReturnType<typeof vi.fn>;
const channelMock = mockSupabaseClient.channel as ReturnType<typeof vi.fn>;
const removeChannelMock = mockSupabaseClient.removeChannel as ReturnType<
  typeof vi.fn
>;

const profA = {
  id: "me",
  username: "alice",
  display_name: "Alice",
  avatar_url: null,
};
const profB = {
  id: "other",
  username: "bob",
  display_name: "Bob",
  avatar_url: null,
};

describe("getConversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns [] when convos is null", async () => {
    fromMock.mockReturnValueOnce(
      createQueryBuilder({ data: null, error: null }),
    );
    expect(await chat.getConversations("me")).toEqual([]);
  });

  it("returns [] when convos is empty", async () => {
    fromMock.mockReturnValueOnce(
      createQueryBuilder({ data: [], error: null }),
    );
    expect(await chat.getConversations("me")).toEqual([]);
  });

  it("resolves the other participant on both sides and builds summaries", async () => {
    // Conversation 1: I am `a` => other is `b`. Has a last message + unread count.
    // Conversation 2: I am `b` => other is `a`. No last message (null), no count.
    const convos = [
      {
        id: "c1",
        last_message_at: "2026-06-30T10:00:00Z",
        a: profA,
        b: profB,
      },
      {
        id: "c2",
        last_message_at: "2026-06-29T10:00:00Z",
        a: profB,
        b: profA,
      },
    ];

    fromMock
      // 1) conversations query
      .mockReturnValueOnce(createQueryBuilder({ data: convos, error: null }))
      // 2) c1 last message (maybeSingle) => present body
      .mockReturnValueOnce(
        createQueryBuilder({ data: { body: "hey there" }, error: null }),
      )
      // 3) c1 unread count => 3
      .mockReturnValueOnce(
        createQueryBuilder({
          data: null,
          error: null,
          count: 3,
        } as unknown as { data: unknown; error: unknown }),
      )
      // 4) c2 last message => null (no message)
      .mockReturnValueOnce(
        createQueryBuilder({ data: null, error: null }),
      )
      // 5) c2 unread count => undefined
      .mockReturnValueOnce(
        createQueryBuilder({ data: null, error: null }),
      );

    const result = await chat.getConversations("me");

    expect(result).toHaveLength(2);

    // c1: I am `a`, so other is `b` (bob).
    expect(result[0].id).toBe("c1");
    expect(result[0].other.id).toBe("other");
    expect(result[0].lastMessageAt).toBe("2026-06-30T10:00:00Z");
    expect(result[0].lastMessageBody).toBe("hey there");
    expect(result[0].unreadCount).toBe(3);

    // c2: I am `b`, so other is `a` (bob is `a` here).
    expect(result[1].id).toBe("c2");
    expect(result[1].other.id).toBe("other");
    expect(result[1].lastMessageBody).toBeNull();
    expect(result[1].unreadCount).toBe(0);
  });
});

describe("getTotalUnread", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the count when present", async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({
        data: null,
        error: null,
        count: 7,
      } as unknown as { data: unknown; error: unknown }),
    );
    expect(await chat.getTotalUnread("me")).toBe(7);
  });

  it("returns 0 when count is undefined/null", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await chat.getTotalUnread("me")).toBe(0);
  });
});

describe("getOrCreateConversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the conversation data on success", async () => {
    const convo = {
      id: "c1",
      user_a: "me",
      user_b: "other",
      created_at: "x",
      last_message_at: "y",
    };
    rpcMock.mockResolvedValueOnce({ data: convo, error: null });

    const result = await chat.getOrCreateConversation("other");

    expect(rpcMock).toHaveBeenCalledWith("get_or_create_conversation", {
      other_id: "other",
    });
    expect(result).toEqual(convo);
  });

  it("throws when the rpc returns an error", async () => {
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { message: "not friends" },
    });
    await expect(chat.getOrCreateConversation("other")).rejects.toThrow(
      "not friends",
    );
  });
});

describe("getMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns rows reversed with the default limit and no before filter", async () => {
    const rows = [
      { id: "m3", body: "third" },
      { id: "m2", body: "second" },
      { id: "m1", body: "first" },
    ];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await chat.getMessages("c1");

    expect(fromMock).toHaveBeenCalledWith("messages");
    expect(builder.eq).toHaveBeenCalledWith("conversation_id", "c1");
    expect(builder.limit).toHaveBeenCalledWith(50);
    expect(builder.lt).not.toHaveBeenCalled();
    // reversed to oldest-first
    expect(result.map((m) => m.id)).toEqual(["m1", "m2", "m3"]);
  });

  it("applies a custom limit and the before filter", async () => {
    const builder = createQueryBuilder({ data: [], error: null });
    fromMock.mockReturnValue(builder);

    await chat.getMessages("c1", { before: "2026-06-30T00:00:00Z", limit: 10 });

    expect(builder.limit).toHaveBeenCalledWith(10);
    expect(builder.lt).toHaveBeenCalledWith(
      "created_at",
      "2026-06-30T00:00:00Z",
    );
  });

  it("returns [] when data is null", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await chat.getMessages("c1")).toEqual([]);
  });
});

describe("sendMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trims the body, inserts, and returns the row", async () => {
    const row = {
      id: "m1",
      conversation_id: "c1",
      sender_id: "me",
      body: "hello",
      created_at: "x",
      read_at: null,
    };
    const builder = createQueryBuilder({ data: row, error: null });
    fromMock.mockReturnValue(builder);

    const result = await chat.sendMessage("c1", "me", "  hello  ");

    expect(fromMock).toHaveBeenCalledWith("messages");
    expect(builder.insert).toHaveBeenCalledWith({
      conversation_id: "c1",
      sender_id: "me",
      body: "hello",
    });
    expect(builder.single).toHaveBeenCalled();
    expect(result).toEqual(row);
  });

  it("throws when the insert returns an error", async () => {
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "blocked" } }),
    );
    await expect(chat.sendMessage("c1", "me", "hi")).rejects.toThrow("blocked");
  });
});

describe("markRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates read_at with the correct filters", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(builder);

    await chat.markRead("c1", "me");

    expect(fromMock).toHaveBeenCalledWith("messages");
    expect(builder.update).toHaveBeenCalledWith({
      read_at: expect.any(String),
    });
    expect(builder.eq).toHaveBeenCalledWith("conversation_id", "c1");
    expect(builder.neq).toHaveBeenCalledWith("sender_id", "me");
    expect(builder.is).toHaveBeenCalledWith("read_at", null);
  });
});

describe("subscribeToConversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes, forwards inserts to onInsert, and unsubscribes via removeChannel", () => {
    const onInsert = vi.fn();
    const unsub = chat.subscribeToConversation("c1", onInsert);

    expect(channelMock).toHaveBeenCalledWith("messages:c1");

    // Grab the channel object and the `.on` handler passed to it.
    const channel = channelMock.mock.results[0].value;
    const onFn = channel.on as ReturnType<typeof vi.fn>;
    expect(onFn).toHaveBeenCalled();
    expect(channel.subscribe).toHaveBeenCalled();

    const handler = onFn.mock.calls[0][2] as (payload: {
      new: unknown;
    }) => void;
    const message = { id: "m1", body: "yo" };
    handler({ new: message });
    expect(onInsert).toHaveBeenCalledWith(message);

    unsub();
    expect(removeChannelMock).toHaveBeenCalledWith(channel);
  });
});

describe("subscribeToInbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes, forwards inserts to onChange, and unsubscribes via removeChannel", () => {
    const onChange = vi.fn();
    const unsub = chat.subscribeToInbox(onChange);

    expect(channelMock).toHaveBeenCalledWith(
      expect.stringMatching(/^inbox:/),
    );

    const channel = channelMock.mock.results[0].value;
    const onFn = channel.on as ReturnType<typeof vi.fn>;
    expect(onFn).toHaveBeenCalled();
    expect(channel.subscribe).toHaveBeenCalled();

    const handler = onFn.mock.calls[0][2] as () => void;
    handler();
    expect(onChange).toHaveBeenCalled();

    unsub();
    expect(removeChannelMock).toHaveBeenCalledWith(channel);
  });
});
