"use client";
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { log } from "@/lib/logger";

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const lng = -118.7891915;
  const lat = 34.1574793;
  const zoom = 14;
  const API_KEY: string | undefined = process.env.NEXT_PUBLIC_MAPLIBRE_API_KEY;
  if (!API_KEY) {
    log.error(`[MapView Component]: Missing API key`);
  }

  useEffect(() => {
    //stops map from initializing more than once
    if (!mapContainer.current || map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    />
  );
}
