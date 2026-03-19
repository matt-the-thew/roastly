"use client";
import mapboxgl, { LngLatLike, Map, NavigationControl } from "mapbox-gl";
import { useRef, useEffect, useState } from "react";
import { locationData, Location } from "./location";
import MarkerContent from "./MarkerContent";
import PopupContent from "./PopupContent";
import { createRoot } from "react-dom/client";
import { MdClose } from "react-icons/md";

function addMarker(
  location: Location,
  map: Map,
  onClick: (location: Location) => void,
) {
  //Create custom div to hold marker ReactNode
  //Initialize root to render it
  const markerCustomElementContainer = document.createElement("div");
  const markerRoot = createRoot(markerCustomElementContainer);
  //click handler for marker container
  markerCustomElementContainer.addEventListener("click", () => {
    onClick(location);
  });

  markerRoot.render(<MarkerContent />);

  const marker = new mapboxgl.Marker(markerCustomElementContainer)
    .setLngLat([location.location.longitude, location.location.latitude])
    .addTo(map);
}

export default function MapComponent() {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const locations: Array<Location> = locationData;

  const [center, setCenter] = useState<[number, number]>([-118.7617, 34.1533]);
  const [zoom, setZoom] = useState(12);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const width = typeof window !== "undefined" ? window.innerWidth : 0;

  //Set up map
  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    //if the map doesn't exist, return
    if (!mapContainerRef.current) {
      return;
    }

    //Initialize map reference object
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: zoom,
    });

    //Enable map movement
    mapRef.current.on("move", () => {
      const mapCenter = mapRef.current!.getCenter();
      const mapZoom = mapRef.current!.getZoom();
      setCenter([mapCenter!.lng, mapCenter!.lat]);
      setZoom(mapZoom);
    });

    //Add markers to map, for each entry in location
    locations.forEach((location) => {
      addMarker(location, mapRef.current!, setSelectedLocation);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  // const straightToBrazil = () => {
  //   if (mapRef.current) {
  //     mapRef.current.flyTo({
  //       center: [-51.7116, -9.54277],
  //       zoom: 8.11,
  //     });
  //   }
  // };

  return (
    <div id="map-container" ref={mapContainerRef} className="w-full h-full">
      {width > 800 && (
        <div className="w-auto h-8 z-10 absolute top-8 left-15 bg-slate-600 text-slate-50 text-lg">
          Lng: {center[0].toFixed(5)} | Lat: {center[1].toFixed(5)} | 🔍:
          {zoom.toFixed(5)} | Width: {width}
        </div>
      )}
      {selectedLocation && (
        <div className="absolute flex flex-col gap-4 top-3 right-4 h-[95%] w-[90%] md:w-[60%] lg:w-[40%] bg-slate-100 shadow-lg z-20 rounded-2xl animate-slide-in">
          <button
            className="bg-amber-200 flex items-center text-[1rem] font-display p-2 cursor-pointer hover:bg-amber-400 active:bg-amber-100 w-fit"
            onClick={() => setSelectedLocation(null)}
          >
            <MdClose />
            Close
          </button>
          <PopupContent
            name={selectedLocation.name}
            description={selectedLocation.description}
          />
        </div>
      )}
    </div>
  );
}
