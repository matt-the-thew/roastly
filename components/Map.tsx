"use client";
import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const lng = 139.753;
  const lat = 35.6844;
  const zoom = 14;
  const API_KEY = "YOUR_MAPTILER_API_KEY_HERE";

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPLIBRE_API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    new maplibregl.Marker({ color: "#FF0000" })
      .setLngLat([139.7525, 35.6846])
      .addTo(map.current);
  }, [API_KEY, lng, lat, zoom]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
