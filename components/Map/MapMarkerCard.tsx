"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { useMapContext } from "@/lib/MapContext";
import type { Location } from "@/lib/fetchLocations";
import { ImageCarousel } from "../ImageCarousel";
import {
  getCafeImages,
  getPublicUrl,
  type CafeImage,
} from "@/lib/supabase/images";
import { distanceByHaversine } from "@/lib/distanceByHaversineFormula";
import { IoClose } from "react-icons/io5";

const FADE_MS = 200;
const MARKER_RADIUS = 24;
const GAP = 12;

type Side = "left" | "right" | "top" | "bottom";

interface Position {
  x: number;
  y: number;
  side: Side;
}

interface Props {
  mapRef: React.RefObject<MapRef | null>;
}

// Pick the side of the marker with the most available room in the map container.
function computePosition(map: MapRef, location: Location): Position {
  const point = map.project([location.longitude, location.latitude]);
  const { width, height } = map.getContainer().getBoundingClientRect();

  const rooms: { side: Side; room: number }[] = [
    { side: "right", room: width - point.x },
    { side: "left", room: point.x },
    { side: "bottom", room: height - point.y },
    { side: "top", room: point.y },
  ];
  rooms.sort((a, b) => b.room - a.room);

  return { x: point.x, y: point.y, side: rooms[0].side };
}

function positionStyle({ x, y, side }: Position): CSSProperties {
  switch (side) {
    case "right":
      return {
        left: x + MARKER_RADIUS + GAP,
        top: y,
        transform: "translateY(-50%)",
      };
    case "left":
      return {
        left: x - MARKER_RADIUS - GAP,
        top: y,
        transform: "translate(-100%, -50%)",
      };
    case "bottom":
      return {
        left: x,
        top: y + MARKER_RADIUS + GAP,
        transform: "translateX(-50%)",
      };
    case "top":
      return {
        left: x,
        top: y - MARKER_RADIUS - GAP,
        transform: "translate(-50%, -100%)",
      };
  }
}

export default function MapMarkerCard({ mapRef }: Props) {
  const { selectedLocation, setSelectedLocation, userLocation } =
    useMapContext();
  const [displayLocation, setDisplayLocation] = useState<Location | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const displayLocationRef = useRef<Location | null>(null);
  displayLocationRef.current = displayLocation;

  // Cross-fade between cards: fade out whatever is showing, then swap content/position and fade in.
  useEffect(() => {
    const map = mapRef.current;

    if (!selectedLocation) {
      setVisible(false);
      const t = setTimeout(() => setDisplayLocation(null), FADE_MS);
      return () => clearTimeout(t);
    }

    if (!map) return;

    const showSelected = () => {
      setDisplayLocation(selectedLocation);
      setPosition(computePosition(map, selectedLocation));
      requestAnimationFrame(() => setVisible(true));
    };

    if (
      !displayLocationRef.current ||
      displayLocationRef.current.id === selectedLocation.id
    ) {
      showSelected();
      return;
    }

    setVisible(false);
    const t = setTimeout(showSelected, FADE_MS);
    return () => clearTimeout(t);
  }, [selectedLocation, mapRef]);

  useEffect(() => {
    if (!displayLocation) {
      setImages([]);
      return;
    }
    getCafeImages(displayLocation.id).then((imgs: CafeImage[]) => {
      setImages(imgs.map((img) => getPublicUrl(img.storage_path)));
    });
  }, [displayLocation?.id]);

  // Any map movement (pan, zoom, programmatic flyTo) invalidates the marker-relative position.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;

    const handleMove = () => setSelectedLocation(null);
    map.on("movestart", handleMove);
    return () => {
      map.off("movestart", handleMove);
    };
  }, [mapRef, selectedLocation, setSelectedLocation]);

  if (!displayLocation || !position) return null;

  const distance = userLocation
    ? distanceByHaversine([
        { lat: userLocation.latitude, lon: userLocation.longitude },
        { lat: displayLocation.latitude, lon: displayLocation.longitude },
      ])
    : null;

  return (
    <div
      className={`absolute z-3 w-80 bg-background rounded-xl shadow-xl overflow-hidden transition-opacity duration-200 ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      style={positionStyle(position)}
    >
      <button
        onClick={() => setSelectedLocation(null)}
        className="absolute top-2 right-2 z-10 bg-background/80 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-primary"
      >
        <IoClose className="text-lg" />
      </button>

      <div className="h-44 w-full">
        <ImageCarousel images={images} />
      </div>

      <div className="p-4 flex flex-col gap-1">
        <h2 className="text-lg font-bold">{displayLocation.name}</h2>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {distance !== null ? `${distance} mi away` : "Distance unknown"}
          </span>
          {displayLocation.vibe && (
            <span className="italic">{displayLocation.vibe}</span>
          )}
        </div>
      </div>
    </div>
  );
}
