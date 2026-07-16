import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import type { User } from "@supabase/supabase-js";
import type { BoundingBox } from "@/lib/boundingBox";
import { MapProvider, useMapContext } from "@/lib/MapContext";
import { mockSupabaseClient } from "@/__mocks__/supabase/supabaseClient";

vi.mock("@/lib/supabase/profile", () => ({ getProfile: vi.fn() }));
vi.mock("@/lib/supabase/friends", () => ({
  getFriendIds: vi.fn(),
  getIncomingRequests: vi.fn(),
  subscribeToFriendRequests: vi.fn(),
}));
vi.mock("@/lib/supabase/likes", () => ({ getLikeCounts: vi.fn() }));
vi.mock("@/lib/supabase/chat", () => ({
  getOrCreateConversation: vi.fn(),
  getTotalUnread: vi.fn(),
  subscribeToInbox: vi.fn(),
}));
vi.mock("@/lib/fetchLocations", () => ({
  fetchLocationsInBounds: vi.fn(),
}));

import { getProfile } from "@/lib/supabase/profile";
import {
  getFriendIds,
  getIncomingRequests,
  subscribeToFriendRequests,
} from "@/lib/supabase/friends";
import { getLikeCounts } from "@/lib/supabase/likes";
import {
  getOrCreateConversation,
  getTotalUnread,
  subscribeToInbox,
} from "@/lib/supabase/chat";
import { fetchLocationsInBounds } from "@/lib/fetchLocations";

const mGetProfile = vi.mocked(getProfile);
const mGetFriendIds = vi.mocked(getFriendIds);
const mGetIncomingRequests = vi.mocked(getIncomingRequests);
const mSubscribeToFriendRequests = vi.mocked(subscribeToFriendRequests);
const mGetLikeCounts = vi.mocked(getLikeCounts);
const mGetOrCreate = vi.mocked(getOrCreateConversation);
const mGetTotalUnread = vi.mocked(getTotalUnread);
const mSubscribe = vi.mocked(subscribeToInbox);
const mFetchLocations = vi.mocked(fetchLocationsInBounds);

const LIKE_COUNT_REFRESH_MS = 5 * 60 * 1000;

const testUser = { id: "user-1", email: "u@x.com" } as unknown as User;

const loc = (id: string, over: Partial<Record<string, unknown>> = {}) =>
  ({
    id,
    description: "d",
    is_verified: true,
    latitude: 1,
    longitude: 2,
    name: `Cafe ${id}`,
    vibe: "cozy",
    ...over,
  }) as never;

// A batch of >= MIN_CAFES_PER_LOAD (10) cafes, so a load resolves in a single
// fetch without the context widening the box to chase the cafe floor.
const manyLocs = Array.from({ length: 10 }, (_, i) => loc(`m${i}`));
const idsOf = (list: unknown[]) =>
  list.map((l) => (l as { id: string }).id).sort();

const other = {
  id: "friend-1",
  username: "friend",
  display_name: "Friend",
  avatar_url: "a.png",
};

// Captured onAuthStateChange callback so tests can simulate auth changes.
let authCallback: ((event: string, session: unknown) => void) | null = null;
const authUnsubscribe = vi.fn();

// Harness exposes the live context value to the test.
let ctx: ReturnType<typeof useMapContext>;
function Harness() {
  ctx = useMapContext();
  return null;
}

async function renderProvider() {
  await act(async () => {
    render(
      <MapProvider>
        <Harness />
      </MapProvider>,
    );
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  authCallback = null;
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: null },
  } as never);
  (
    mockSupabaseClient.auth.onAuthStateChange as ReturnType<typeof vi.fn>
  ).mockImplementation((cb: (event: string, session: unknown) => void) => {
    authCallback = cb;
    return { data: { subscription: { unsubscribe: authUnsubscribe } } };
  });
  mGetProfile.mockResolvedValue({
    id: "user-1",
    username: "me",
    display_name: "Me",
    avatar_url: "me.png",
  } as never);
  mGetFriendIds.mockResolvedValue(new Set(["friend-1"]));
  mGetIncomingRequests.mockResolvedValue([]);
  mSubscribeToFriendRequests.mockReturnValue(vi.fn());
  mGetLikeCounts.mockResolvedValue({ a: 3 });
  mGetTotalUnread.mockResolvedValue(7);
  mSubscribe.mockReturnValue(vi.fn());
  mGetOrCreate.mockResolvedValue({ id: "convo-1" } as never);
  mFetchLocations.mockResolvedValue([loc("a")]);
  // Reset URL/search for the deep-link effect.
  window.history.replaceState({}, "", "/dashboard/homepage");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useMapContext outside provider", () => {
  it("throws a descriptive error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Harness />)).toThrow(
      "useMapContext must be used within MapProvider",
    );
    spy.mockRestore();
  });
});

describe("auth bootstrap", () => {
  it("sets user from getUser on mount", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: testUser },
    } as never);
    await renderProvider();
    await waitFor(() => expect(ctx.user).toEqual(testUser));
  });

  it("falls back to null when getUser returns no user", async () => {
    await renderProvider();
    await waitFor(() => expect(ctx.user).toBeNull());
  });

  it("updates user via onAuthStateChange for session and null", async () => {
    await renderProvider();
    await act(async () => {
      authCallback?.("SIGNED_IN", { user: testUser });
    });
    await waitFor(() => expect(ctx.user).toEqual(testUser));
    await act(async () => {
      authCallback?.("SIGNED_OUT", null);
    });
    await waitFor(() => expect(ctx.user).toBeNull());
  });

  it("unsubscribes the auth listener on unmount", async () => {
    let unmount!: () => void;
    await act(async () => {
      const r = render(
        <MapProvider>
          <Harness />
        </MapProvider>,
      );
      unmount = r.unmount;
    });
    act(() => unmount());
    expect(authUnsubscribe).toHaveBeenCalled();
  });
});

describe("selectedLocation -> overlayView", () => {
  it("switches to cafeDetails when a location is selected and back to cafeList", async () => {
    await renderProvider();
    expect(ctx.overlayView).toBe("cafeList");
    await act(async () => ctx.setSelectedLocation(loc("x")));
    await waitFor(() => expect(ctx.overlayView).toBe("cafeDetails"));
    expect(ctx.selectedLocation).not.toBeNull();
    await act(async () => ctx.setSelectedLocation(null));
    await waitFor(() => expect(ctx.overlayView).toBe("cafeList"));
  });
});

describe("like counts effect", () => {
  it("returns early when there are no locations", async () => {
    await renderProvider();
    expect(mGetLikeCounts).not.toHaveBeenCalled();
    expect(ctx.likeCounts).toEqual({});
  });

  it("loads counts after locations load and refreshes on interval, clearing on unmount", async () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    let unmount!: () => void;
    await act(async () => {
      const r = render(
        <MapProvider>
          <Harness />
        </MapProvider>,
      );
      unmount = r.unmount;
    });

    // Flush the load + the like-counts effect's microtask chain. waitFor is
    // unusable here because its internal polling timers are faked; assert
    // directly after act settles the promises instead.
    await act(async () => {
      await ctx.loadCafesInBounds({
        minLng: 0,
        minLat: 0,
        maxLng: 10,
        maxLat: 10,
      });
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mGetLikeCounts).toHaveBeenCalledWith(["a"]);
    expect(ctx.likeCounts).toEqual({ a: 3 });

    mGetLikeCounts.mockResolvedValueOnce({ a: 99 });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIKE_COUNT_REFRESH_MS);
    });
    expect(ctx.likeCounts).toEqual({ a: 99 });

    act(() => unmount());
    expect(clearSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("social data", () => {
  it("loads profile + friendIds when user is set", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: testUser },
    } as never);
    await renderProvider();
    await waitFor(() => {
      expect(mGetProfile).toHaveBeenCalledWith("user-1");
      expect(mGetFriendIds).toHaveBeenCalledWith("user-1");
    });
    expect(ctx.profile).not.toBeNull();
    expect(ctx.friendIds.has("friend-1")).toBe(true);
  });

  it("clears profile/friendIds when user becomes null", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: testUser },
    } as never);
    await renderProvider();
    await waitFor(() => expect(ctx.profile).not.toBeNull());
    await act(async () => {
      authCallback?.("SIGNED_OUT", null);
    });
    await waitFor(() => {
      expect(ctx.profile).toBeNull();
      expect(ctx.friendIds.size).toBe(0);
    });
  });

  it("refreshProfile reloads when a user is present", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: testUser },
    } as never);
    await renderProvider();
    await waitFor(() => expect(mGetProfile).toHaveBeenCalled());
    mGetProfile.mockClear();
    mGetFriendIds.mockClear();
    await act(async () => {
      await ctx.refreshProfile();
    });
    expect(mGetProfile).toHaveBeenCalledWith("user-1");
    expect(mGetFriendIds).toHaveBeenCalledWith("user-1");
  });

  it("refreshProfile returns early when there is no user", async () => {
    await renderProvider();
    await waitFor(() => expect(ctx.user).toBeNull());
    mGetProfile.mockClear();
    await act(async () => {
      await ctx.refreshProfile();
    });
    expect(mGetProfile).not.toHaveBeenCalled();
  });
});

describe("loadCafesInBounds + isRegionLoaded", () => {
  const bounds: BoundingBox = { minLng: 0, minLat: 0, maxLng: 10, maxLat: 10 };

  it("toggles loading, fetches the padded viewport, sets cafes, and records the region", async () => {
    mFetchLocations.mockResolvedValueOnce(manyLocs);
    await renderProvider();

    await act(async () => {
      await ctx.loadCafesInBounds(bounds);
    });

    // Padded viewport (ratio 0.5 => pad by half the span). >= 10 cafes came
    // back, so the box was not widened — a single fetch at the padded box.
    expect(mFetchLocations).toHaveBeenCalledTimes(1);
    expect(mFetchLocations).toHaveBeenCalledWith({
      minLng: -5,
      maxLng: 15,
      minLat: -5,
      maxLat: 15,
    });
    expect(idsOf(ctx.locations)).toEqual(idsOf(manyLocs));
    expect(ctx.isLoadingCafes).toBe(false);

    // Contained region is now loaded; a disjoint one is not.
    expect(
      ctx.isRegionLoaded({ minLng: 1, minLat: 1, maxLng: 9, maxLat: 9 }),
    ).toBe(true);
    expect(
      ctx.isRegionLoaded({
        minLng: 100,
        minLat: 100,
        maxLng: 200,
        maxLat: 200,
      }),
    ).toBe(false);
  });

  it("flushes the previous working set (cafes + region) on the next load", async () => {
    mFetchLocations.mockResolvedValueOnce(manyLocs);
    await renderProvider();
    await act(async () => {
      await ctx.loadCafesInBounds(bounds);
    });
    expect(idsOf(ctx.locations)).toEqual(idsOf(manyLocs));

    // A load elsewhere replaces the old cafes and the old cached region.
    const fresh = Array.from({ length: 10 }, (_, i) => loc(`f${i}`));
    mFetchLocations.mockResolvedValueOnce(fresh);
    await act(async () => {
      await ctx.loadCafesInBounds({
        minLng: 50,
        minLat: 50,
        maxLng: 60,
        maxLat: 60,
      });
    });

    expect(idsOf(ctx.locations)).toEqual(idsOf(fresh));
    // The first region is no longer cached — only the new region's box is.
    expect(
      ctx.isRegionLoaded({ minLng: 1, minLat: 1, maxLng: 9, maxLat: 9 }),
    ).toBe(false);
    expect(
      ctx.isRegionLoaded({ minLng: 51, minLat: 51, maxLng: 59, maxLat: 59 }),
    ).toBe(true);
  });

  it("widens the box until it holds at least the minimum number of cafes", async () => {
    // First padded box is too sparse; the once-widened box clears the floor.
    mFetchLocations.mockResolvedValueOnce([loc("a"), loc("b")]);
    mFetchLocations.mockResolvedValueOnce(manyLocs);
    await renderProvider();

    await act(async () => {
      await ctx.loadCafesInBounds(bounds);
    });

    expect(mFetchLocations).toHaveBeenCalledTimes(2);
    // Padded box first...
    expect(mFetchLocations).toHaveBeenNthCalledWith(1, {
      minLng: -5,
      maxLng: 15,
      minLat: -5,
      maxLat: 15,
    });
    // ...then widened once more (another 0.5 pad on the 20-wide box => 10/side).
    expect(mFetchLocations).toHaveBeenNthCalledWith(2, {
      minLng: -15,
      maxLng: 25,
      minLat: -15,
      maxLat: 25,
    });
    expect(idsOf(ctx.locations)).toEqual(idsOf(manyLocs));
  });

  it("stops widening after the expansion cap and keeps what it found", async () => {
    // Every fetch stays under the floor, so the loop runs to the cap.
    mFetchLocations.mockResolvedValue([loc("a")]);
    await renderProvider();

    await act(async () => {
      await ctx.loadCafesInBounds(bounds);
    });

    // 1 initial padded fetch + MAX_LOAD_EXPANSIONS (4) widenings.
    expect(mFetchLocations).toHaveBeenCalledTimes(5);
    expect(idsOf(ctx.locations)).toEqual(["a"]);
  });
});

describe("unread + inbox subscription", () => {
  it("refreshUnread sets total from getTotalUnread when user present", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: testUser },
    } as never);
    await renderProvider();
    await waitFor(() => expect(ctx.unreadTotal).toBe(7));
    expect(mGetTotalUnread).toHaveBeenCalledWith("user-1");
  });

  it("refreshUnread sets 0 when no user", async () => {
    await renderProvider();
    await act(async () => {
      await ctx.refreshUnread();
    });
    expect(ctx.unreadTotal).toBe(0);
    expect(mGetTotalUnread).not.toHaveBeenCalled();
  });

  it("subscribes to inbox and calls unsub on unmount", async () => {
    const unsub = vi.fn();
    mSubscribe.mockReturnValue(unsub);
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: testUser },
    } as never);
    let unmount!: () => void;
    await act(async () => {
      const r = render(
        <MapProvider>
          <Harness />
        </MapProvider>,
      );
      unmount = r.unmount;
    });
    await waitFor(() => expect(mSubscribe).toHaveBeenCalled());
    act(() => unmount());
    expect(unsub).toHaveBeenCalled();
  });

  it("clears unread + active conversation when user is null (inbox effect)", async () => {
    await renderProvider();
    expect(ctx.unreadTotal).toBe(0);
    expect(ctx.activeConversation).toBeNull();
    expect(mSubscribe).not.toHaveBeenCalled();
  });
});

describe("deep link (?message=)", () => {
  it("opens a chat thread with the target profile", async () => {
    window.history.replaceState({}, "", "/dashboard/homepage?message=friend-1");
    mGetProfile.mockImplementation(async (id: string) => {
      if (id === "friend-1") {
        return {
          id: "friend-1",
          username: "friend",
          display_name: "Friend",
          avatar_url: "a.png",
        } as never;
      }
      return {
        id: "user-1",
        username: "me",
        display_name: "Me",
        avatar_url: "me.png",
      } as never;
    });
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: testUser },
    } as never);

    await renderProvider();

    await waitFor(() => {
      expect(mGetOrCreate).toHaveBeenCalledWith("friend-1");
      expect(ctx.overlayView).toBe("chatThread");
    });
    expect(ctx.activeConversation?.id).toBe("convo-1");
    // Param stripped so a refresh doesn't retrigger.
    expect(window.location.search).toBe("");
  });

  it("does nothing when there is no message param", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: testUser },
    } as never);
    await renderProvider();
    await waitFor(() => expect(ctx.user).toEqual(testUser));
    expect(mGetOrCreate).not.toHaveBeenCalled();
    expect(ctx.overlayView).toBe("cafeList");
  });

  it("does not open a chat when the target profile is falsy", async () => {
    window.history.replaceState({}, "", "/dashboard/homepage?message=ghost");
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: testUser },
    } as never);
    mGetProfile.mockImplementation(async (id: string) => {
      if (id === "ghost") return null as never;
      return {
        id: "user-1",
        username: "me",
        display_name: "Me",
        avatar_url: "me.png",
      } as never;
    });
    await renderProvider();
    await waitFor(() => expect(mGetProfile).toHaveBeenCalledWith("ghost"));
    expect(mGetOrCreate).not.toHaveBeenCalled();
    expect(ctx.overlayView).toBe("cafeList");
    // Param still stripped.
    await waitFor(() => expect(window.location.search).toBe(""));
  });

  it("does nothing when there is no user", async () => {
    window.history.replaceState({}, "", "/dashboard/homepage?message=friend-1");
    await renderProvider();
    await waitFor(() => expect(ctx.user).toBeNull());
    expect(mGetOrCreate).not.toHaveBeenCalled();
  });
});

describe("chat open helpers", () => {
  it("openMessages shows the conversation list and the sidebar", async () => {
    await renderProvider();
    await act(async () => ctx.openMessages());
    await waitFor(() => expect(ctx.overlayView).toBe("conversationList"));
    expect(ctx.sidebarVisible).toBe(true);
  });

  it("openConversation sets active conversation + chat thread", async () => {
    await renderProvider();
    await act(async () => ctx.openConversation("c-9", other));
    await waitFor(() => expect(ctx.overlayView).toBe("chatThread"));
    expect(ctx.activeConversation).toEqual({ id: "c-9", other });
    expect(ctx.sidebarVisible).toBe(true);
  });

  it("openChatWith resolves a conversation then opens it", async () => {
    mGetOrCreate.mockResolvedValue({ id: "convo-abc" } as never);
    await renderProvider();
    await act(async () => {
      await ctx.openChatWith(other);
    });
    expect(mGetOrCreate).toHaveBeenCalledWith("friend-1");
    await waitFor(() => expect(ctx.overlayView).toBe("chatThread"));
    expect(ctx.activeConversation?.id).toBe("convo-abc");
  });
});

describe("like count mutators", () => {
  it("adjustLikeCount increments an existing key and initializes a missing key", async () => {
    await renderProvider();
    await act(async () => ctx.adjustLikeCount("a", 2));
    await waitFor(() => expect(ctx.likeCounts.a).toBe(2)); // missing -> 0 + 2
    await act(async () => ctx.adjustLikeCount("a", 3));
    await waitFor(() => expect(ctx.likeCounts.a).toBe(5)); // existing -> 2 + 3
    await act(async () => ctx.adjustLikeCount("a", -1));
    await waitFor(() => expect(ctx.likeCounts.a).toBe(4));
  });

  it("refreshLikeCounts returns early with no locations", async () => {
    await renderProvider();
    mGetLikeCounts.mockClear();
    await act(async () => {
      await ctx.refreshLikeCounts();
    });
    expect(mGetLikeCounts).not.toHaveBeenCalled();
  });

  it("refreshLikeCounts loads counts when locations exist", async () => {
    await renderProvider();
    await act(async () => {
      await ctx.loadCafesInBounds({
        minLng: 0,
        minLat: 0,
        maxLng: 10,
        maxLat: 10,
      });
    });
    mGetLikeCounts.mockClear();
    mGetLikeCounts.mockResolvedValueOnce({ a: 42 });
    await act(async () => {
      await ctx.refreshLikeCounts();
    });
    expect(mGetLikeCounts).toHaveBeenCalledWith(["a"]);
    await waitFor(() => expect(ctx.likeCounts).toEqual({ a: 42 }));
  });
});

describe("misc setters + geolocate", () => {
  it("setUserLocation stores coordinates", async () => {
    await renderProvider();
    await act(async () => ctx.setUserLocation(12, 34));
    await waitFor(() =>
      expect(ctx.userLocation).toEqual({ latitude: 12, longitude: 34 }),
    );
  });

  it("triggerGeolocate is a no-op before any trigger is registered", async () => {
    await renderProvider();
    // Exercises the default () => () => {} initializer without throwing.
    await act(async () => ctx.triggerGeolocate());
    expect(ctx.userLocation).toBeNull();
  });

  it("triggerGeolocate invokes the registered trigger fn", async () => {
    await renderProvider();
    const fn = vi.fn();
    await act(async () => ctx.setGeolocateTrigger(fn));
    await act(async () => ctx.triggerGeolocate());
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("setZoomLevel, setFeedVisible, setSidebarVisible, setSelectedCity update state", async () => {
    await renderProvider();
    await act(async () => ctx.setZoomLevel(14));
    await waitFor(() => expect(ctx.zoomLevel).toBe(14));
    await act(async () => ctx.setFeedVisible(true));
    await waitFor(() => expect(ctx.feedVisible).toBe(true));
    await act(async () => ctx.setSidebarVisible(false));
    await waitFor(() => expect(ctx.sidebarVisible).toBe(false));
    await act(async () => ctx.setSelectedCity("Portland"));
    await waitFor(() => expect(ctx.selectedCity).toBe("Portland"));
    await act(async () => ctx.setOverlayView("submissionForm"));
    await waitFor(() => expect(ctx.overlayView).toBe("submissionForm"));
  });
});
