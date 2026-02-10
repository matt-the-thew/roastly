"use client";

import Map, { GeolocateControl, Marker } from "react-map-gl/mapbox";
import { Location, locationData } from "@/components/location";

function HomePage() {
  return (
    <Map
      mapboxAccessToken={`${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
      initialViewState={{
        longitude: -118.7617,
        latitude: 34.1533,
        zoom: 10,
      }}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle={"mapbox://styles/mapbox/standard"}
    >
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        showUserLocation={true}
      />
      {locationData.map((index: Location) => (
        <Marker
          key={index.name}
          longitude={index.longitude}
          latitude={index.latitude}
        ></Marker>
      ))}
    </Map>
  );
}

export default HomePage;
