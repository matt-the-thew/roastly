"use client";
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { log } from "@/lib/logger";

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const lng = 50;
  const lat = 50;
  const zoom = 14;
  const API_KEY: string | undefined = process.env.NEXT_PUBLIC_MAPLIBRE_API_KEY;
  if (!API_KEY) {
    log.error(`[MapView Component]: Missing API key`);
  }

  useEffect(() => {
    if (map.current) return; //stops map from initializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });
  }, []);

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
