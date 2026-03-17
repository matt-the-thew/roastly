import mapboxgl, { LngLatLike, Map } from "mapbox-gl";
import { useRef, useEffect, useState } from "react";
import { locationData, Location } from "./location";
import Popup from "./Popup";

function addMarker(location: Location, map: Map) {
  const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
    `<h1>${location.name}</h1><p>${location.description}</p>`,
  );

  const marker = new mapboxgl.Marker()
    .setLngLat([location.location.longitude, location.location.latitude])
    .setPopup(popup)
    .addTo(map);
}

export default function MapComponent() {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [center, setCenter] = useState<[number, number]>([-118.7617, 34.1533]);
  const [zoom, setZoom] = useState(12);
  const locations: Array<Location> = locationData;

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    //if the map doesn't exist, return
    if (!mapContainerRef.current) {
      return;
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: zoom,
    });

    mapRef.current.on("move", () => {
      const mapCenter = mapRef.current!.getCenter();
      const mapZoom = mapRef.current!.getZoom();

      setCenter([mapCenter!.lng, mapCenter!.lat]);
      setZoom(mapZoom);

      console.log(`fetched data: ${mapCenter} ${mapZoom}`);
    });

    locations.forEach((location) => {
      addMarker(location, mapRef.current!);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  const straightToBrazil = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [-51.7116, -9.54277],
        zoom: 8.11,
      });
    }
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
