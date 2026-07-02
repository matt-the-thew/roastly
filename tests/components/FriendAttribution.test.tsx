import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import FriendAttribution from "@/components/Social/FriendAttribution";
import * as likes from "@/lib/supabase/likes";
import * as mapContext from "@/lib/MapContext";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/supabase/likes", () => ({
  getLikersForCafe: vi.fn(),
}));

vi.mock("@/lib/MapContext", () => ({
  useMapContext: vi.fn(),
}));

type Liker = {
  id: string;
  user_id: string;
  cafe_id: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    is_private: boolean;
  };
};

function liker(userId: string, displayName: string): Liker {
  return {
    id: `like-${userId}`,
    user_id: userId,
    cafe_id: "cafe-1",
    created_at: "2026-01-01T00:00:00Z",
    profiles: {
      id: userId,
      username: `${displayName.toLowerCase()}-user`,
      display_name: displayName,
      avatar_url: "",
      is_private: false,
    },
  };
}

function setContext(friendIds: string[]) {
  (mapContext.useMapContext as ReturnType<typeof vi.fn>).mockReturnValue({
    friendIds: new Set(friendIds),
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("FriendAttribution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when there are no friends (never queries)", async () => {
    setContext([]);
    const { container } = render(<FriendAttribution cafeId="cafe-1" />);
    await flush();
    expect(likes.getLikersForCafe).not.toHaveBeenCalled();
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when no friends have liked the cafe", async () => {
    setContext(["u1"]);
    (likes.getLikersForCafe as ReturnType<typeof vi.fn>).mockResolvedValue([
      liker("stranger", "Stranger"),
    ]);
    const { container } = render(<FriendAttribution cafeId="cafe-1" />);
    await flush();
    expect(container.firstChild).toBeNull();
  });

  it("singular phrasing for exactly one friend liker", async () => {
    setContext(["u1"]);
    (likes.getLikersForCafe as ReturnType<typeof vi.fn>).mockResolvedValue([
      liker("u1", "Alice"),
    ]);
    render(<FriendAttribution cafeId="cafe-1" />);
    await flush();
    expect(screen.getByText("Alice liked this")).toBeDefined();
  });

  it("two-name phrasing for exactly two friend likers", async () => {
    setContext(["u1", "u2"]);
    (likes.getLikersForCafe as ReturnType<typeof vi.fn>).mockResolvedValue([
      liker("u1", "Alice"),
      liker("u2", "Bob"),
    ]);
    render(<FriendAttribution cafeId="cafe-1" />);
    await flush();
    expect(screen.getByText("Alice and Bob liked this")).toBeDefined();
  });

  it("three-name phrasing with no extras", async () => {
    setContext(["u1", "u2", "u3"]);
    (likes.getLikersForCafe as ReturnType<typeof vi.fn>).mockResolvedValue([
      liker("u1", "Alice"),
      liker("u2", "Bob"),
      liker("u3", "Carol"),
    ]);
    render(<FriendAttribution cafeId="cafe-1" />);
    await flush();
    expect(screen.getByText("Alice, Bob, Carol liked this")).toBeDefined();
  });

  it("one name + singular 'other' when exactly one extra beyond a single shown name is impossible; uses 3-shown 'and N more' branch", async () => {
    setContext(["u1", "u2", "u3", "u4", "u5"]);
    (likes.getLikersForCafe as ReturnType<typeof vi.fn>).mockResolvedValue([
      liker("u1", "Alice"),
      liker("u2", "Bob"),
      liker("u3", "Carol"),
      liker("u4", "Dave"),
      liker("u5", "Eve"),
    ]);
    render(<FriendAttribution cafeId="cafe-1" />);
    await flush();
    // 5 friends -> shows 3, 2 extra -> "and 2 more"
    expect(
      screen.getByText("Alice, Bob, Carol and 2 more liked this"),
    ).toBeDefined();
  });

  it("falls back to username when a liker has no display_name", async () => {
    setContext(["u1"]);
    const l = liker("u1", "Alice");
    l.profiles.display_name = "";
    l.profiles.username = "aliceuser";
    (likes.getLikersForCafe as ReturnType<typeof vi.fn>).mockResolvedValue([l]);
    render(<FriendAttribution cafeId="cafe-1" />);
    await flush();
    expect(screen.getByText("aliceuser liked this")).toBeDefined();
  });

  it("navigates to a liker's profile when their avatar button is clicked", async () => {
    setContext(["u1"]);
    (likes.getLikersForCafe as ReturnType<typeof vi.fn>).mockResolvedValue([
      liker("u1", "Alice"),
    ]);
    render(<FriendAttribution cafeId="cafe-1" />);
    await flush();
    fireEvent.click(screen.getByRole("button"));
    expect(push).toHaveBeenCalledWith("/profile/alice-user");
  });
});
