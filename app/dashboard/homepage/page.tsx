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
          {/*
            TODO: Position the Map UI over the MapComponent with absolute positioning
                  This is how Mapbox intends for the map to be used; it expects to own the whole element
                  Better practice.
            */}
          <MapOverlay />
        </MapComponent>
      </div>
    </MapProvider>
  );
}

export default HomePage;
