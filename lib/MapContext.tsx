"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Location } from "@/lib/fetchLocations";
import type { Profile } from "@/lib/supabase/profile";
import { getProfile } from "@/lib/supabase/profile";
import { getFriendIds } from "@/lib/supabase/friends";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type OverlayView = "cafeList" | "cafeDetails" | "submissionForm";

interface MapContextValue {
  // map / cafe state
  locations: Location[];
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
  // auth / social state
  user: User | null;
  profile: Profile | null;
  friendIds: Set<string>;
  refreshProfile: () => Promise<void>;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({
  locations,
  children,
}: {
  locations: Location[];
  children: React.ReactNode;
}) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState("Los Angeles");
  const [overlayView, setOverlayView] = useState<OverlayView>("cafeList");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [feedVisible, setFeedVisible] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (selectedLocation) setOverlayView("cafeDetails");
  }, [selectedLocation]);

  // Bootstrap auth state once on mount
  useEffect(() => {
    const supabase = createClient();
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

  return (
    <MapContext.Provider
      value={{
        locations,
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
        user,
        profile,
        friendIds,
        refreshProfile,
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
