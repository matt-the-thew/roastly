"use client";
import MapComponent from "@/ui/components/MapComponent";
import MapUserControls from "@/ui/components/MapUserControls";
import MapOverlay from "@/ui/components/MapOverlay";
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
        (error) => console.error(`Error pulling locations from database: ${error}`),
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
