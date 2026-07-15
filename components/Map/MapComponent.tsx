"use client";
import Map, {
  Marker,
  GeolocateControl,
  MapRef,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import { useRef, useEffect, useCallback, useState } from "react";
import { useMapContext } from "@/lib/MapContext";
import MarkerContent from "./MapMarkerContent";
import MapMarkerCard from "./MapMarkerCard";
import LoadCafesHereButton from "./LoadCafesHereButton";
import type { BoundingBox } from "@/lib/boundingBox";
import "mapbox-gl/dist/mapbox-gl.css";

const CITY_COORDS: Record<string, [number, number]> = {
  "Los Angeles": [-118.2426, 34.0549],
  "New York": [-73.9352, 40.7306],
  Chicago: [-87.65, 41.85],
  Seattle: [-122.2426, 47.3328],
};

interface Props {
  children: React.ReactNode;
}

const ZOOM_THROTTLE_MS = 100;

function getViewportBounds(
  mapRef: React.RefObject<MapRef | null>,
): BoundingBox | null {
  const bounds = mapRef.current?.getMap().getBounds();
  if (!bounds) return null;
  return {
    minLng: bounds.getWest(),
    maxLng: bounds.getEast(),
    minLat: bounds.getSouth(),
    maxLat: bounds.getNorth(),
  };
}

export default function MapComponent({ children }: Props) {
  const mapRef = useRef<MapRef>(null);
  const geolocateRef = useRef<mapboxgl.GeolocateControl>(null);
  const lastZoomUpdateRef = useRef(0);
  const [viewportBounds, setViewportBounds] = useState<BoundingBox | null>(
    null,
  );

  const {
    setZoomLevel,
    locations,
    setSelectedLocation,
    selectedCity,
    friendIds,
    setUserLocation,
    setGeolocateTrigger,
    isRegionLoaded,
    loadCafesInBounds,
  } = useMapContext();

  useEffect(() => {
    setGeolocateTrigger(() => geolocateRef.current?.trigger());
  }, [setGeolocateTrigger]);

  // Fly to city when selectedCity changes
  useEffect(() => {
    const coords: [number, number] | undefined = selectedCity
      ? CITY_COORDS[selectedCity]
      : undefined;
    if (coords) {
      mapRef.current?.flyTo({
        center: coords,
        duration: 2000,
        zoom: 10.5,
      });
    }
  }, [selectedCity]);

  const friendIdArray = Array.from(friendIds);

  const handleLoad = useCallback(() => {
    geolocateRef.current?.trigger();
    // Bootstrap the initial cafe cache for whatever viewport we land on.
    const bounds = getViewportBounds(mapRef);
    if (bounds) {
      loadCafesInBounds(bounds);
    }
  }, [loadCafesInBounds]);

  const handleZoom = useCallback(
    (e: ViewStateChangeEvent) => {
      const now = Date.now();
      if (now - lastZoomUpdateRef.current < ZOOM_THROTTLE_MS) return;
      lastZoomUpdateRef.current = now;
      setZoomLevel(e.viewState.zoom);
    },
    [setZoomLevel],
  );

  const handleZoomEnd = useCallback(
    (e: ViewStateChangeEvent) => {
      lastZoomUpdateRef.current = Date.now();
      setZoomLevel(e.viewState.zoom);
    },
    [setZoomLevel],
  );

  // After any pan/zoom settles, check whether the new viewport is already
  // covered by a cached region. If not, surface the "Load cafes here" button
  // instead of auto-fetching, so panning around doesn't spam queries.
  const handleMoveEnd = useCallback(() => {
    const bounds = getViewportBounds(mapRef);
    if (!bounds) return;
    setViewportBounds(isRegionLoaded(bounds) ? null : bounds);
  }, [isRegionLoaded]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: CITY_COORDS["Los Angeles"][0],
        latitude: CITY_COORDS["Los Angeles"][1],
        zoom: 12,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/standard"
      logoPosition="bottom-right"
      onLoad={handleLoad}
      onZoom={handleZoom}
      onZoomEnd={handleZoomEnd}
      onMoveEnd={handleMoveEnd}
    >
      <GeolocateControl
        ref={geolocateRef}
        position="top-right"
        trackUserLocation={true}
        showAccuracyCircle={true}
        positionOptions={{ enableHighAccuracy: true }}
        onGeolocate={(e) =>
          setUserLocation(e.coords.latitude, e.coords.longitude)
        }
      />

      {locations.map((location) => (
        <Marker
          key={location.id}
          longitude={location.longitude}
          latitude={location.latitude}
          onClick={() => setSelectedLocation(location)}
        >
          <MarkerContent
            cafeId={location.id}
            cafeName={location.name}
            friendIds={friendIdArray}
          />
        </Marker>
      ))}

      <MapMarkerCard mapRef={mapRef} />

      {viewportBounds && (
        <LoadCafesHereButton
          bounds={viewportBounds}
          onLoaded={() => setViewportBounds(null)}
        />
      )}

      {children}
    </Map>
  );
}
