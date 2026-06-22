"use client";
import MapComponent from "@/components/Map/MapComponent";
import MapUserControls from "@/components/Map/MapUserControls";
import MapOverlay from "@/components/Map/MapOverlay";
import { fetchLocations, Location } from "@/lib/fetchLocations";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapProvider } from "@/lib/MapContext";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/client";

function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const supabase = browserClient();
  const router = useRouter();

  useEffect(() => {
    // Redundant authorization check after proxy ok-s initial req
    // supabase.auth.getUser().then(({ data }) => {
    //   if (!data.user) {
    //     router.replace("/auth/login");
    //     return;
    //   }
    // });
    // Bootstrap initial cafe list once on mount
    // TODO: Add bounding box-based query limiting
    // TODO: Add rate limiting in general.
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
