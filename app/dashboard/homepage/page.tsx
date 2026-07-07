"use client";
import MapComponent from "@/components/Map/MapComponent";
import MapUserControls from "@/components/Map/MapUserControls";
import MapOverlay from "@/components/Map/MapOverlay";
import { MapProvider } from "@/lib/MapContext";

function HomePage() {
  return (
    <MapProvider>
      <div className="flex flex-col h-full w-full">
        <MapUserControls />
        <MapComponent>
          <MapOverlay />
        </MapComponent>
      </div>
    </MapProvider>
  );
}

export default HomePage;
