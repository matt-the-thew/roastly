"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Location } from "@/lib/fetchLocations";

export type OverlayView = "cafeList" | "cafeDetails" | "submissionForm";

interface MapContextValue {
  locations: Location[];
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  overlayView: OverlayView;
  setOverlayView: (view: OverlayView) => void;
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
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

  useEffect(() => {
    if (selectedLocation) {
      setOverlayView("cafeDetails");
    }
  }, [selectedLocation]);

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
