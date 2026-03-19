"use client";
import mapboxgl, { LngLatLike, Map } from "mapbox-gl";
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
  const [center, setCenter] = useState<[number, number]>([-118.7617, 34.1533]);
  const [zoom, setZoom] = useState(12);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const locations: Array<Location> = locationData;
  const [width, setWidth] = useState<number>(0);

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

      // console.log(`fetched data: ${mapCenter} ${mapZoom}`);
    });

    //Determine window width
    //FIXME: Fix window resize handler bug, where width always
    // equals zero
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    //Add zoom and rotation controls
    //conditionally based on device
    const navigationControl = new mapboxgl.NavigationControl();
    if (!mapRef.current.hasControl(navigationControl) && width > 800) {
      mapRef.current.addControl(navigationControl, "top-left");
    } else if (mapRef.current.hasControl(navigationControl) && width < 800) {
      mapRef.current.removeControl(navigationControl);
    }

    //Add markers to map, for each entry in location
    locations.forEach((location) => {
      addMarker(location, mapRef.current!, setSelectedLocation);
    });

    return () => {
      mapRef.current?.remove();
      window.removeEventListener("resize", handleResize);
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
          {zoom.toFixed(5)}
        </div>
      )}
      {selectedLocation && (
        //FIXME: Modal covers entire screen on larger devices
        <div className="absolute flex flex-col gap-4 top-3 right-4 h-[95%] w-[90%] bg-slate-100 shadow-lg z-20 rounded-2xl animate-slide-in">
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
