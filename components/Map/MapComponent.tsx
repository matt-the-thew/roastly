"use client";
import mapboxgl, { Map, GeolocateControl } from "mapbox-gl";
import { useRef, useEffect } from "react";
import { Location } from "@/lib/fetchLocations";
import MarkerContent from "./MapMarkerContent";
import { createRoot } from "react-dom/client";
import { useMapContext } from "@/lib/MapContext";

const CITY_COORDS: Record<string, [number, number]> = {
  "Los Angeles": [-118.2426, 34.0549],
  "New York": [-73.9352, 40.7306],
  Chicago: [-87.65, 41.85],
  Seattle: [-122.2426, 47.3328],
};

interface MarkerHandle {
  marker: mapboxgl.Marker;
  root: ReturnType<typeof createRoot>;
}

function renderMarker(
  location: Location,
  map: Map,
  onClick: (location: Location) => void,
  friendIds: string[],
): MarkerHandle {
  const el = document.createElement("div");
  const root = createRoot(el);
  el.addEventListener("click", () => onClick(location));
  root.render(
    <MarkerContent
      cafeId={location.id}
      cafeName={location.name}
      friendIds={friendIds}
    />,
  );
  const marker = new mapboxgl.Marker({ element: el })
    .setLngLat([location.longitude, location.latitude])
    .addTo(map);
  return { marker, root };
}

interface Props {
  children: React.ReactNode;
}

export default function MapComponent({ children }: Props) {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<MarkerHandle[]>([]);
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    selectedCity,
    friendIds,
  } = useMapContext();

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    // If a map exists, or the map's container is not ready, return
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      logoPosition: "bottom-right",
      center: [-118.7617, 34.1533],
      zoom: 12,
    });

    const geolocate = new GeolocateControl({
      trackUserLocation: true,
      showAccuracyCircle: true,
      positionOptions: { enableHighAccuracy: true },
    });

    mapRef.current.addControl(geolocate, "top-right");
    mapRef.current.on("load", () => geolocate.trigger());

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Rebuild markers whenever locations or friendIds change so hover popups reflect current friend data
  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    // Clean up old markers
    for (const { marker, root } of markersRef.current) {
      marker.remove();
      root.unmount();
    }
    markersRef.current = [];

    const friendIdArray = Array.from(friendIds);
    markersRef.current = locations.map((location) =>
      renderMarker(
        location,
        mapRef.current!,
        setSelectedLocation,
        friendIdArray,
      ),
    );
  }, [locations, friendIds]);

  useEffect(() => {
    const coords = CITY_COORDS[selectedCity];
    if (coords)
      mapRef.current?.flyTo({ center: coords, duration: 500, zoom: 10.5 });
  }, [selectedCity]);

  useEffect(() => {
    if (selectedLocation) {
      mapRef.current?.flyTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        duration: 300,
      });
    }
  }, [selectedLocation]);

  return (
    <div id="map-container" ref={mapContainerRef} className="w-full h-full">
      {children}
    </div>
  );
}
