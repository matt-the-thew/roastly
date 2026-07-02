import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import LikeButton from "@/components/CafeList/LikeButton";
import * as likes from "@/lib/supabase/likes";
import * as mapContext from "@/lib/MapContext";

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/lib/supabase/likes", () => ({
  getUserLike: vi.fn(),
  toggleLike: vi.fn(),
}));

vi.mock("@/lib/MapContext", () => ({
  useMapContext: vi.fn(),
}));

describe("LikeButton", () => {
  const adjustLikeCount = vi.fn();
  const baseContext = {
    user: { id: "user-1" },
    profile: { id: "user-1" },
    likeCounts: { "cafe-1": 5 },
    adjustLikeCount,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (mapContext.useMapContext as ReturnType<typeof vi.fn>).mockReturnValue(
      baseContext,
    );
    (likes.getUserLike as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    (likes.toggleLike as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function flushMicrotasks() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  it("renders the count from the shared context cache, not its own query", async () => {
    render(<LikeButton cafeId="cafe-1" />);
    await flushMicrotasks();
    expect(screen.getByText("5")).toBeDefined();
  });

  it("collapses rapid clicks into a single debounced write", async () => {
    render(<LikeButton cafeId="cafe-1" />);
    await flushMicrotasks();
    const button = screen.getByRole("button");

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(adjustLikeCount).toHaveBeenCalledTimes(3);
    expect(likes.toggleLike).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(likes.toggleLike).toHaveBeenCalledTimes(1);
    expect(likes.toggleLike).toHaveBeenCalledWith("user-1", "cafe-1", false);
  });

  it("skips the write entirely when clicks net out to a no-op", async () => {
    render(<LikeButton cafeId="cafe-1" />);
    await flushMicrotasks();
    const button = screen.getByRole("button");

    fireEvent.click(button); // like
    fireEvent.click(button); // unlike -> net matches server baseline (false)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(likes.toggleLike).not.toHaveBeenCalled();
  });

  it("reverts optimistic state and shows an error toast if the write fails", async () => {
    (likes.toggleLike as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("network error"),
    );
    render(<LikeButton cafeId="cafe-1" />);
    await flushMicrotasks();
    const button = screen.getByRole("button");

    fireEvent.click(button);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(adjustLikeCount).toHaveBeenCalledWith("cafe-1", 1); // optimistic
    expect(adjustLikeCount).toHaveBeenCalledWith("cafe-1", -1); // revert
  });

  it("shows a sign-in toast and performs no write when there is no profile", async () => {
    const toast = (await import("react-hot-toast")).default;
    (mapContext.useMapContext as ReturnType<typeof vi.fn>).mockReturnValue({
      ...baseContext,
      user: { id: "user-1" },
      profile: null,
    });
    render(<LikeButton cafeId="cafe-1" />);
    await flushMicrotasks();
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(toast.error).toHaveBeenCalledWith("Sign in to like cafes");
    expect(adjustLikeCount).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(likes.toggleLike).not.toHaveBeenCalled();
  });

  it("re-adds the count when UNLIKING fails against a server-liked baseline", async () => {
    // Server baseline is `true`; unliking then failing must revert with +1
    // (the `baseline ? 1 : -1` true branch).
    (likes.getUserLike as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (likes.toggleLike as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("network error"),
    );
    render(<LikeButton cafeId="cafe-1" />);
    await flushMicrotasks();
    const button = screen.getByRole("button");

    fireEvent.click(button); // unlike
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(likes.toggleLike).toHaveBeenCalledWith("user-1", "cafe-1", true);
    expect(adjustLikeCount).toHaveBeenCalledWith("cafe-1", -1); // optimistic unlike
    expect(adjustLikeCount).toHaveBeenCalledWith("cafe-1", 1); // revert re-adds
  });
});
