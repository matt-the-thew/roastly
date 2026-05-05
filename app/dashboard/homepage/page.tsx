"use client";
import MapComponent from "@/components/Map/MapComponent";
import MapUserControls from "@/components/Map/MapUserControls";
import MapOverlay from "@/components/Map/MapOverlay";
import { fetchLocations, Location } from "@/lib/fetchLocations";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapProvider } from "@/lib/MapContext";

function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    toast
      .promise(fetchLocations(), {
        loading: "Loading cafes",
        success: "Cafes loaded",
        error: "Problem loading cafes",
      })
      .then(
        (locationList) => setLocations(locationList),
        (error) =>
          console.error(`Error pulling locations from database: ${error}`),
      );
  }, []);

  return (
    <MapProvider locations={locations}>
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
