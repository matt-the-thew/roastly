"use client";

import Map from "react-map-gl/mapbox";
import { log } from "@/lib/logger";

function HomePage() {
  log.debug(`using api key ${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`);

  return (
    <Map
      mapboxAccessToken={`${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
      initialViewState={{
        longitude: -118.7617,
        latitude: 34.1533,
        zoom: 10,
      }}
      style={{ width: 500, height: 500 }}
      mapStyle={"mapbox://styles/mapbox/standard"}
    />
  );
}

export default HomePage;
