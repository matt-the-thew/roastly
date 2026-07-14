import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ConversationList from "@/components/Chat/ConversationList";
import * as chat from "@/lib/supabase/chat";
import * as mapContext from "@/lib/MapContext";
import type { ConversationSummary } from "@/lib/supabase/chat";

vi.mock("@/lib/supabase/chat", () => ({
  getConversations: vi.fn(),
  subscribeToInbox: vi.fn(),
}));

vi.mock("@/lib/MapContext", () => ({
  useMapContext: vi.fn(),
}));

const useMapContextMock = mapContext.useMapContext as ReturnType<typeof vi.fn>;
const getConversationsMock = chat.getConversations as ReturnType<typeof vi.fn>;
const subscribeToInboxMock = chat.subscribeToInbox as ReturnType<typeof vi.fn>;

const user = { id: "me-1" };
const openConversation = vi.fn();
const setOverlayView = vi.fn();

function setContext(overrides: Record<string, unknown> = {}) {
  useMapContextMock.mockReturnValue({
    user,
    openConversation,
    setOverlayView,
    ...overrides,
  });
}

function convo(
  overrides: Partial<ConversationSummary> = {},
): ConversationSummary {
  return {
    id: "c-1",
    other: {
      id: "them-1",
      username: "barista",
      display_name: "Barista Bob",
      avatar_url: "",
    },
    lastMessageAt: new Date().toISOString(),
    lastMessageBody: "latest message",
    unreadCount: 0,
    ...overrides,
  };
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setContext();
  getConversationsMock.mockResolvedValue([]);
  subscribeToInboxMock.mockReturnValue(() => {});
});

describe("ConversationList", () => {
  it("shows the empty state and no loading when there is no user", async () => {
    setContext({ user: null });
    render(<ConversationList />);
    await flushMicrotasks();
    expect(screen.getByText("No messages yet.")).toBeDefined();
    expect(getConversationsMock).not.toHaveBeenCalled();
  });

  it("shows the loading state before data resolves", async () => {
    let resolve: (v: ConversationSummary[]) => void = () => {};
    getConversationsMock.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    render(<ConversationList />);
    expect(screen.getByText("Loading…")).toBeDefined();
    await act(async () => {
      resolve([]);
      await Promise.resolve();
    });
    expect(screen.queryByText("Loading…")).toBeNull();
  });

  it("renders conversations with unread badge, display name, and preview", async () => {
    getConversationsMock.mockResolvedValue([
      convo({ id: "c-unread", unreadCount: 3, lastMessageBody: "unread body" }),
    ]);
    render(<ConversationList />);
    await flushMicrotasks();

    expect(screen.getByText("Barista Bob")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined(); // unread badge
    expect(screen.getByText("unread body")).toBeDefined();
    // unread -> bold name styling
    expect(screen.getByText("Barista Bob").className).toContain("font-bold");
  });

  it("uses username fallback, hides badge, and shows placeholder when no last message", async () => {
    getConversationsMock.mockResolvedValue([
      convo({
        id: "c-read",
        unreadCount: 0,
        lastMessageBody: null,
        other: {
          id: "them-2",
          username: "onlyuser",
          display_name: "",
          avatar_url: "",
        },
      }),
    ]);
    render(<ConversationList />);
    await flushMicrotasks();

    expect(screen.getByText("onlyuser")).toBeDefined();
    expect(screen.getByText("No messages yet")).toBeDefined();
    // no unread -> medium (not bold)
    expect(screen.getByText("onlyuser").className).toContain("font-medium");
  });

  it("back button switches to the cafe list", async () => {
    render(<ConversationList />);
    await flushMicrotasks();
    fireEvent.click(screen.getByLabelText("Back to cafes"));
    expect(setOverlayView).toHaveBeenCalledWith("cafeList");
  });

  it("clicking a conversation opens it", async () => {
    const c = convo({ id: "c-click" });
    getConversationsMock.mockResolvedValue([c]);
    render(<ConversationList />);
    await flushMicrotasks();
    fireEvent.click(screen.getByText("Barista Bob"));
    expect(openConversation).toHaveBeenCalledWith("c-click", c.other);
  });

  it("subscribeToInbox refresh callback reloads conversations", async () => {
    let refresh: () => void = () => {};
    subscribeToInboxMock.mockImplementation((cb: () => void) => {
      refresh = cb;
      return () => {};
    });
    getConversationsMock.mockResolvedValue([]);
    render(<ConversationList />);
    await flushMicrotasks();
    expect(screen.getByText("No messages yet.")).toBeDefined();

    getConversationsMock.mockResolvedValue([convo({ id: "c-new" })]);
    await act(async () => {
      refresh();
      await Promise.resolve();
    });
    expect(screen.getByText("latest message")).toBeDefined();
  });
});
