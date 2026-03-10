"use client";
import Map, { GeolocateControl, Marker, Layer } from "react-map-gl/mapbox";
import { Location, locationData } from "@/ui/components/location";
import MarkerInterior from "./MarkerInterior";
import { useState } from "react";

function MapView() {
  return (
    <Map
      mapboxAccessToken={`${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
      initialViewState={{
        longitude: -118.7617,
        latitude: 34.1533,
        zoom: 12,
      }}
      style={{ width: "100%", height: "100%", zIndex: 1 }}
      mapStyle={"mapbox://styles/mapbox/standard"}
      onLoad={(e) => {
        const map = e.target;

        map.getStyle().layers?.forEach((layer) => {
          if (layer.type === "symbol" && layer.layout?.["text-field"]) {
            map.setLayoutProperty(layer.id, "visibility", "none");
          }
        });
      }}
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
          offset={[0, 0]}
        >
          <MarkerInterior name={index.name} />
        </Marker>
      ))}
    </Map>
  );
}

export default MapView;
