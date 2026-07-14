"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Location, fetchLocationsInBounds } from "@/lib/fetchLocations";
import type { Profile } from "@/lib/supabase/profile";
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
import { browserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  type BoundingBox,
  expandBounds,
  isCoveredByAny,
} from "@/lib/boundingBox";

const LIKE_COUNT_REFRESH_MS = 5 * 60 * 1000;

export type OverlayView =
  | "cafeList"
  | "cafeDetails"
  | "submissionForm"
  | "conversationList"
  | "chatThread"
  | "friends";

/** The other participant + conversation id for the open chat thread. */
export interface ActiveConversation {
  id: string;
  other: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface LatLongCoordinates {
  latitude: number;
  longitude: number;
}

interface MapContextValue {
  // map / cafe state
  locations: Location[];
  isLoadingCafes: boolean;
  isRegionLoaded: (bounds: BoundingBox) => boolean;
  loadCafesInBounds: (bounds: BoundingBox) => Promise<void>;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  overlayView: OverlayView;
  setOverlayView: (view: OverlayView) => void;
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  feedVisible: boolean;
  setFeedVisible: (visible: boolean) => void;
  zoomLevel: number | null;
  setZoomLevel: (level: number) => void;
  // user location state
  userLocation: LatLongCoordinates | null;
  setUserLocation: (latitude: number, longitude: number) => void;
  triggerGeolocate: () => void;
  setGeolocateTrigger: (fn: () => void) => void;
  // auth / social state
  user: User | null;
  profile: Profile | null;
  friendIds: Set<string>;
  refreshProfile: () => Promise<void>;
  // chat state
  activeConversation: ActiveConversation | null;
  unreadTotal: number;
  refreshUnread: () => Promise<void>;
  openMessages: () => void;
  openConversation: (id: string, other: ActiveConversation["other"]) => void;
  openChatWith: (other: ActiveConversation["other"]) => Promise<void>;
  // friends state
  pendingRequestCount: number;
  refreshFriendRequests: () => Promise<void>;
  openFriends: () => void;
  // like state
  likeCounts: Record<string, number>;
  adjustLikeCount: (cafeId: string, delta: number) => void;
  refreshLikeCounts: () => Promise<void>;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  // Buffered bounding boxes already fetched & cached in memory. A viewport
  // contained within any of these regions can be served without a query.
  const [loadedRegions, setLoadedRegions] = useState<BoundingBox[]>([]);
  const [isLoadingCafes, setIsLoadingCafes] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState("Los Angeles");
  const [overlayView, setOverlayView] = useState<OverlayView>("cafeList");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [feedVisible, setFeedVisible] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);
  const [userLocation, setUserLocationState] =
    useState<LatLongCoordinates | null>(null);
  const [geolocateTrigger, setGeolocateTriggerState] = useState<() => void>(
    () => () => {},
  );
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [activeConversation, setActiveConversation] =
    useState<ActiveConversation | null>(null);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    setOverlayView(selectedLocation ? "cafeDetails" : "cafeList");
  }, [selectedLocation]);

  // Bootstrap + periodically refresh batched like counts for all visible cafes
  useEffect(() => {
    if (locations.length === 0) return;
    const ids = locations.map((l) => l.id);
    const load = () => getLikeCounts(ids).then(setLikeCounts);
    load();
    const interval = setInterval(load, LIKE_COUNT_REFRESH_MS);
    return () => clearInterval(interval);
  }, [locations]);

  // Bootstrap auth state once on mount
  useEffect(() => {
    const supabase = browserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);
  // Load profile + friend IDs when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setFriendIds(new Set());
      return;
    }
    loadSocialData(user.id);
  }, [user]);

  function setUserLocation(latitude: number, longitude: number) {
    setUserLocationState({ latitude, longitude });
  }

  function triggerGeolocate() {
    geolocateTrigger();
  }

  const setGeolocateTrigger = useCallback((fn: () => void) => {
    setGeolocateTriggerState(() => fn);
  }, []);

  const isRegionLoaded = useCallback(
    (bounds: BoundingBox) => isCoveredByAny(bounds, loadedRegions),
    [loadedRegions],
  );

  // Fetches cafes within a buffered perimeter around `bounds` and merges
  // them into the in-memory cache, so panning back into this area later
  // is served from memory instead of re-querying Supabase.
  const loadCafesInBounds = useCallback(async (bounds: BoundingBox) => {
    setIsLoadingCafes(true);
    try {
      const buffered = expandBounds(bounds);
      const fetched = await fetchLocationsInBounds(buffered);
      setLocations((prev) => {
        const byId = new Map(prev.map((l) => [l.id, l]));
        for (const location of fetched) {
          byId.set(location.id, location);
        }
        return Array.from(byId.values());
      });
      setLoadedRegions((prev) => [...prev, buffered]);
    } finally {
      setIsLoadingCafes(false);
    }
  }, []);

  async function loadSocialData(userId: string) {
    const [p, ids] = await Promise.all([
      getProfile(userId),
      getFriendIds(userId),
    ]);
    setProfile(p);
    setFriendIds(ids);
  }

  async function refreshProfile() {
    if (!user) return;
    await loadSocialData(user.id);
  }

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadTotal(0);
      return;
    }
    setUnreadTotal(await getTotalUnread(user.id));
  }, [user]);

  // Keep the inbox badge live: bootstrap the count, then refresh on any new
  // message across the user's conversations.
  useEffect(() => {
    if (!user) {
      setUnreadTotal(0);
      setActiveConversation(null);
      return;
    }
    refreshUnread();
    const unsub = subscribeToInbox(refreshUnread);
    return unsub;
  }, [user, refreshUnread]);

  // Deep link: /dashboard/homepage?message=<userId> opens that chat directly
  // (used by the "Message" button on friend profiles, which live off-provider).
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("message");
    if (!targetId) return;
    getProfile(targetId).then((p) => {
      if (p) {
        openChatWith({
          id: p.id,
          username: p.username,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
        });
      }
      // Strip the param so a refresh doesn't re-trigger it.
      window.history.replaceState({}, "", window.location.pathname);
    });
  }, [user]);

  const refreshFriendRequests = useCallback(async () => {
    if (!user) {
      setPendingRequestCount(0);
      return;
    }
    const incoming = await getIncomingRequests(user.id);
    setPendingRequestCount(incoming.length);
  }, [user]);

  // Keep the friends badge live: bootstrap the count, then refresh on any
  // change to requests addressed to this user.
  useEffect(() => {
    if (!user) {
      setPendingRequestCount(0);
      return;
    }
    refreshFriendRequests();
    const unsub = subscribeToFriendRequests(user.id, refreshFriendRequests);
    return unsub;
  }, [user, refreshFriendRequests]);

  function openFriends() {
    setOverlayView("friends");
    setSidebarVisible(true);
  }

  function openMessages() {
    setOverlayView("conversationList");
    setSidebarVisible(true);
  }

  function openConversation(id: string, other: ActiveConversation["other"]) {
    setActiveConversation({ id, other });
    setOverlayView("chatThread");
    setSidebarVisible(true);
  }

  // Resolve (or create) the conversation with a friend, then open it.
  async function openChatWith(other: ActiveConversation["other"]) {
    const convo = await getOrCreateConversation(other.id);
    openConversation(convo.id, other);
  }

  function adjustLikeCount(cafeId: string, delta: number) {
    setLikeCounts((prev) => ({
      ...prev,
      [cafeId]: (prev[cafeId] ?? 0) + delta,
    }));
  }

  async function refreshLikeCounts() {
    if (locations.length === 0) return;
    const counts = await getLikeCounts(locations.map((l) => l.id));
    setLikeCounts(counts);
  }

  return (
    <MapContext.Provider
      value={{
        locations,
        isLoadingCafes,
        isRegionLoaded,
        loadCafesInBounds,
        selectedLocation,
        setSelectedLocation,
        selectedCity,
        setSelectedCity,
        overlayView,
        setOverlayView,
        sidebarVisible,
        setSidebarVisible,
        feedVisible,
        setFeedVisible,
        zoomLevel,
        setZoomLevel,
        userLocation,
        setUserLocation,
        triggerGeolocate,
        setGeolocateTrigger,
        user,
        profile,
        friendIds,
        refreshProfile,
        activeConversation,
        unreadTotal,
        refreshUnread,
        openMessages,
        openConversation,
        openChatWith,
        pendingRequestCount,
        refreshFriendRequests,
        openFriends,
        likeCounts,
        adjustLikeCount,
        refreshLikeCounts,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within MapProvider");
  return ctx;
}
