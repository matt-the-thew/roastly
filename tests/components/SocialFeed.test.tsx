import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import SocialFeed from "@/components/Social/SocialFeed";
import * as feed from "@/lib/supabase/feed";
import * as mapContext from "@/lib/MapContext";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/supabase/feed", () => ({
  getSocialFeed: vi.fn(),
}));

vi.mock("@/lib/MapContext", () => ({
  useMapContext: vi.fn(),
}));

function setContext(value: Record<string, unknown>) {
  (mapContext.useMapContext as ReturnType<typeof vi.fn>).mockReturnValue(value);
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function entry(id: string, displayName: string, cafeName: string) {
  return {
    id,
    user_id: `u-${id}`,
    cafe_id: `c-${id}`,
    cafe_name: cafeName,
    // recent enough that timeAgo -> "just now" but we don't assert on it
    created_at: new Date().toISOString(),
    profile: {
      id: `u-${id}`,
      username: `${displayName.toLowerCase()}-user`,
      display_name: displayName,
      avatar_url: "",
    },
  };
}

describe("SocialFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("always renders the 'Friend activity' header", async () => {
    setContext({ user: null, friendIds: new Set() });
    render(<SocialFeed />);
    await flush();
    expect(screen.getByText("Friend activity")).toBeDefined();
  });

  it("shows the signed-out state with a sign-in button when there is no user", async () => {
    setContext({ user: null, friendIds: new Set() });
    render(<SocialFeed />);
    await flush();
    expect(
      screen.getByText("Sign in to see what your friends are liking."),
    ).toBeDefined();
    expect(feed.getSocialFeed).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Sign in →"));
    expect(push).toHaveBeenCalledWith("/auth/login");
  });

  it("shows the empty state once loading resolves with no entries", async () => {
    setContext({ user: { id: "me" }, friendIds: new Set(["f1"]) });
    (feed.getSocialFeed as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<SocialFeed />);
    await flush();
    expect(screen.getByText("No activity yet.")).toBeDefined();
    expect(
      screen.getByText("Add friends to see their cafe likes here."),
    ).toBeDefined();
    expect(feed.getSocialFeed).toHaveBeenCalledWith("me", ["f1"]);
  });

  it("renders the populated feed list with display names and cafe names", async () => {
    setContext({ user: { id: "me" }, friendIds: new Set(["f1", "f2"]) });
    (feed.getSocialFeed as ReturnType<typeof vi.fn>).mockResolvedValue([
      entry("1", "Alice", "Blue Bottle"),
      entry("2", "Bob", "Verve"),
    ]);
    render(<SocialFeed />);
    await flush();

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getByText("Blue Bottle")).toBeDefined();
    expect(screen.getByText("Verve")).toBeDefined();
    // no empty state shown
    expect(screen.queryByText("No activity yet.")).toBeNull();
  });

  it("falls back to username in the feed row when display_name is empty", async () => {
    setContext({ user: { id: "me" }, friendIds: new Set(["f1"]) });
    const e = entry("1", "Alice", "Blue Bottle");
    e.profile.display_name = "";
    e.profile.username = "aliceuser";
    (feed.getSocialFeed as ReturnType<typeof vi.fn>).mockResolvedValue([e]);
    render(<SocialFeed />);
    await flush();
    expect(screen.getByText("aliceuser")).toBeDefined();
  });

  it("navigates to a profile when the name button in a feed row is clicked", async () => {
    setContext({ user: { id: "me" }, friendIds: new Set(["f1"]) });
    (feed.getSocialFeed as ReturnType<typeof vi.fn>).mockResolvedValue([
      entry("1", "Alice", "Blue Bottle"),
    ]);
    render(<SocialFeed />);
    await flush();
    fireEvent.click(screen.getByText("Alice"));
    expect(push).toHaveBeenCalledWith("/profile/alice-user");
  });

  it("navigates to a profile when the avatar button in a feed row is clicked", async () => {
    setContext({ user: { id: "me" }, friendIds: new Set(["f1"]) });
    (feed.getSocialFeed as ReturnType<typeof vi.fn>).mockResolvedValue([
      entry("1", "Alice", "Blue Bottle"),
    ]);
    render(<SocialFeed />);
    await flush();
    // the avatar button is the first button in the row (before the name button)
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(push).toHaveBeenCalledWith("/profile/alice-user");
  });
});
