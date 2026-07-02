import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
} from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ChatThread from "@/components/Chat/ChatThread";
import * as chat from "@/lib/supabase/chat";
import * as mapContext from "@/lib/MapContext";
import toast from "react-hot-toast";
import type { Message } from "@/lib/supabase/chat";

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/lib/supabase/chat", () => ({
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
  markRead: vi.fn(),
  subscribeToConversation: vi.fn(),
}));

vi.mock("@/lib/MapContext", () => ({
  useMapContext: vi.fn(),
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const useMapContextMock = mapContext.useMapContext as ReturnType<typeof vi.fn>;
const getMessagesMock = chat.getMessages as ReturnType<typeof vi.fn>;
const sendMessageMock = chat.sendMessage as ReturnType<typeof vi.fn>;
const markReadMock = chat.markRead as ReturnType<typeof vi.fn>;
const subscribeMock = chat.subscribeToConversation as ReturnType<typeof vi.fn>;

const user = { id: "me-1" };
const other = {
  id: "them-1",
  username: "barista",
  display_name: "Barista Bob",
  avatar_url: null,
};

const setOverlayView = vi.fn();
const refreshUnread = vi.fn();

function msg(overrides: Partial<Message>): Message {
  return {
    id: "m-1",
    conversation_id: "c-1",
    sender_id: "them-1",
    body: "hi",
    created_at: new Date().toISOString(),
    read_at: null,
    ...overrides,
  };
}

function setContext(overrides: Record<string, unknown> = {}) {
  useMapContextMock.mockReturnValue({
    user,
    activeConversation: { id: "c-1", other },
    setOverlayView,
    refreshUnread,
    ...overrides,
  });
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
  getMessagesMock.mockResolvedValue([]);
  sendMessageMock.mockResolvedValue(msg({ id: "sent-1", sender_id: "me-1", body: "yo" }));
  markReadMock.mockResolvedValue(undefined);
  subscribeMock.mockReturnValue(() => {});
});

describe("ChatThread", () => {
  it("renders null when there is no other participant", () => {
    setContext({ activeConversation: null });
    const { container } = render(<ChatThread />);
    expect(container.firstChild).toBeNull();
    expect(getMessagesMock).not.toHaveBeenCalled();
  });

  it("shows the empty state when there are no messages", async () => {
    getMessagesMock.mockResolvedValue([]);
    render(<ChatThread />);
    await flushMicrotasks();
    expect(screen.getByText("Say hello 👋")).toBeDefined();
    expect(markReadMock).toHaveBeenCalledWith("c-1", "me-1");
    expect(refreshUnread).toHaveBeenCalled();
  });

  it("loads history and styles mine vs theirs", async () => {
    getMessagesMock.mockResolvedValue([
      msg({ id: "a", sender_id: "me-1", body: "mine msg" }),
      msg({ id: "b", sender_id: "them-1", body: "their msg" }),
    ]);
    render(<ChatThread />);
    await flushMicrotasks();

    const mine = screen.getByText("mine msg");
    const theirs = screen.getByText("their msg");
    expect(mine.className).toContain("self-end");
    expect(mine.className).toContain("bg-primary");
    expect(theirs.className).toContain("self-start");
    expect(theirs.className).toContain("bg-gray-100");
    // header shows display name
    expect(screen.getByText("Barista Bob")).toBeDefined();
  });

  it("falls back to username in the header when there is no display name", async () => {
    setContext({
      activeConversation: {
        id: "c-1",
        other: { ...other, display_name: null },
      },
    });
    render(<ChatThread />);
    await flushMicrotasks();
    expect(screen.getByText("barista")).toBeDefined();
  });

  it("appends inbound realtime messages and marks them read", async () => {
    let cb: (m: Message) => void = () => {};
    subscribeMock.mockImplementation((_id, callback) => {
      cb = callback;
      return () => {};
    });
    getMessagesMock.mockResolvedValue([]);
    render(<ChatThread />);
    await flushMicrotasks();
    markReadMock.mockClear();
    refreshUnread.mockClear();

    // inbound message from other user -> appended + markRead
    await act(async () => {
      cb(msg({ id: "rt-1", sender_id: "them-1", body: "incoming" }));
      await Promise.resolve();
    });
    expect(screen.getByText("incoming")).toBeDefined();
    expect(markReadMock).toHaveBeenCalledWith("c-1", "me-1");

    // dedupe branch: same id again -> not duplicated
    await act(async () => {
      cb(msg({ id: "rt-1", sender_id: "them-1", body: "incoming" }));
      await Promise.resolve();
    });
    expect(screen.getAllByText("incoming")).toHaveLength(1);

    // my own echoed message -> appended but NOT markRead
    markReadMock.mockClear();
    await act(async () => {
      cb(msg({ id: "rt-2", sender_id: "me-1", body: "myecho" }));
      await Promise.resolve();
    });
    expect(screen.getByText("myecho")).toBeDefined();
    expect(markReadMock).not.toHaveBeenCalled();
  });

  it("calls unsubscribe on unmount", async () => {
    const unsub = vi.fn();
    subscribeMock.mockReturnValue(unsub);
    const { unmount } = render(<ChatThread />);
    await flushMicrotasks();
    unmount();
    expect(unsub).toHaveBeenCalled();
  });

  it("back button switches to the conversation list", async () => {
    render(<ChatThread />);
    await flushMicrotasks();
    fireEvent.click(screen.getByLabelText("Back to messages"));
    expect(setOverlayView).toHaveBeenCalledWith("conversationList");
  });

  it("typing updates the draft and sending appends the message", async () => {
    render(<ChatThread />);
    await flushMicrotasks();
    const textarea = screen.getByPlaceholderText("Message…") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "yo" } });
    expect(textarea.value).toBe("yo");

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Send"));
      await Promise.resolve();
    });
    expect(sendMessageMock).toHaveBeenCalledWith("c-1", "me-1", "yo");
    expect(screen.getByText("yo")).toBeDefined();
    expect(textarea.value).toBe("");
  });

  it("dedupes an echoed send that matches an already-appended message", async () => {
    let cb: (m: Message) => void = () => {};
    subscribeMock.mockImplementation((_id, callback) => {
      cb = callback;
      return () => {};
    });
    sendMessageMock.mockResolvedValue(msg({ id: "dup-1", sender_id: "me-1", body: "hey" }));
    render(<ChatThread />);
    await flushMicrotasks();

    const textarea = screen.getByPlaceholderText("Message…");
    fireEvent.change(textarea, { target: { value: "hey" } });
    // realtime delivers it first
    await act(async () => {
      cb(msg({ id: "dup-1", sender_id: "me-1", body: "hey" }));
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(screen.getByLabelText("Send"));
      await Promise.resolve();
    });
    expect(screen.getAllByText("hey")).toHaveLength(1);
  });

  it("does not send when the draft is empty (guard branch)", async () => {
    render(<ChatThread />);
    await flushMicrotasks();
    const textarea = screen.getByPlaceholderText("Message…");
    // whitespace only -> trimmed to empty
    fireEvent.change(textarea, { target: { value: "   " } });
    await act(async () => {
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      await Promise.resolve();
    });
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it("Enter without shift sends; Shift+Enter does not", async () => {
    render(<ChatThread />);
    await flushMicrotasks();
    const textarea = screen.getByPlaceholderText("Message…");
    fireEvent.change(textarea, { target: { value: "hello" } });

    // Shift+Enter -> no send
    await act(async () => {
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
      await Promise.resolve();
    });
    expect(sendMessageMock).not.toHaveBeenCalled();

    // Enter -> send
    await act(async () => {
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      await Promise.resolve();
    });
    expect(sendMessageMock).toHaveBeenCalledWith("c-1", "me-1", "hello");
  });

  it("restores draft and toasts the friends error on send failure", async () => {
    sendMessageMock.mockRejectedValue(new Error("not friends anymore"));
    render(<ChatThread />);
    await flushMicrotasks();
    const textarea = screen.getByPlaceholderText("Message…") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "blocked" } });
    await act(async () => {
      fireEvent.click(screen.getByLabelText("Send"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(toast.error).toHaveBeenCalledWith(
      "You can only message current friends.",
    );
    expect(textarea.value).toBe("blocked");
  });

  it("toasts a generic error for non-friends failures", async () => {
    sendMessageMock.mockRejectedValue(new Error("network down"));
    render(<ChatThread />);
    await flushMicrotasks();
    const textarea = screen.getByPlaceholderText("Message…") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "oops" } });
    await act(async () => {
      fireEvent.click(screen.getByLabelText("Send"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(toast.error).toHaveBeenCalledWith("Couldn't send message.");
    expect(textarea.value).toBe("oops");
  });

  it("does not load when there is no user", () => {
    setContext({ user: null });
    render(<ChatThread />);
    expect(getMessagesMock).not.toHaveBeenCalled();
  });
});
