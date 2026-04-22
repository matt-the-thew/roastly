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

function addMarker(
  location: Location,
  map: Map,
  onClick: (location: Location) => void,
) {
  const el = document.createElement("div");
  const root = createRoot(el);
  el.addEventListener("click", () => onClick(location));
  root.render(<MarkerContent />);
  new mapboxgl.Marker({ element: el })
    .setLngLat([location.longitude, location.latitude])
    .addTo(map);
}

interface Props {
  children: React.ReactNode;
}

export default function MapComponent({ children }: Props) {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { locations, selectedLocation, setSelectedLocation, selectedCity } =
    useMapContext();
  const width = typeof window !== "undefined" ? window.innerWidth : 0;

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
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

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;
    locations.forEach((location) =>
      addMarker(location, mapRef.current!, setSelectedLocation),
    );
  }, [locations]);

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
