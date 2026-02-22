import mapboxgl, { LngLatLike } from "mapbox-gl";
import { useRef, useEffect, useState } from "react";

interface intialMapView {
  coordinates: LngLatLike;
  zoom: number;
}

const initialMapView: intialMapView = {
  coordinates: [-118.7617, 34.1533],
  zoom: 12,
};

export default function MapComponent() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [center, setCenter] = useState(initialMapView.coordinates);
  const [zoom, setZoom] = useState(initialMapView.zoom);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: zoom,
    });

    mapRef.current.on("move", () => {
      const mapCenter = mapRef.current.getCenter();
      const mapZoom = mapRef.current.getZoom();

      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(mapZoom);

      console.log(`fetched data: ${mapCenter} ${mapZoom}`);
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    console.log("stateful data", center[0], center[1], zoom);
  });

  const straightToBrazil = () => {
    mapRef.current.flyTo({
      center: [-51.7116, -9.54277],
      zoom: 8.11,
    });
  };

  return (
    <div id="map-container" ref={mapContainerRef} className="w-full h-full">
      <div className="w-auto h-8 z-10 absolute top-6 left-4 bg-slate-600 text-slate-50 text-lg">
        Lng: {center[0].toFixed(5)} | Lat: {center[1].toFixed(5)} | 🔍:
        {zoom.toFixed(5)}
      </div>
      <button
        onClick={straightToBrazil}
        className="z-10 w-auto h-auto p-4 absolute right-8 top-8 bg-slate-500 text-slate-50 text-[16px] cursor-pointer hover:bg-red-600"
      >
        brazil immediately
      </button>
    </div>
  );
}
