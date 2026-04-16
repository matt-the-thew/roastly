"use client";
import MapComponent from "@/ui/components/MapComponent";
import MapUserControls from "@/ui/components/MapUserControls";
import MapOverlay from "@/ui/components/MapOverlay";
import { fetchLocations, Location } from "@/lib/fetchLocations";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCity, setSelectedCity] = useState("Los Angeles");
  const [selectedLocationName, setSelectedLocationName] = useState<
    string | null
  >(null);

  function recieveCityStateData(value: string): void {
    setSelectedCity(value);
  }

  function recieveSelectedLocationName(value: string): void {
    setSelectedLocationName(value);
  }

  //eventually this will changed based on passed-up bounding box data
  useEffect(() => {
    const promiseObject = fetchLocations();
    toast
      .promise(promiseObject, {
        loading: "Loading cafes",
        success: "Cafes loaded",
        error: "Problem loading cafes",
      })
      .then(
        (locationList) => {
          setLocations(locationList);
        },
        (error) => {
          console.error(`Error pulling locations from database: ${error}`);
        },
      );
  }, []);

  useEffect(() => {
    console.log(selectedLocationName);
  }, [selectedLocationName]);

  useEffect(() => {});

  return (
    <div className="flex flex-col h-full w-full">
      <MapUserControls></MapUserControls>
      <MapComponent
        sendSelectedLocation={recieveSelectedLocationName}
        selectedCity={selectedCity}
        locationList={locations}
      >
        <MapOverlay
          locations={locations}
          sendCityStateData={recieveCityStateData}
          selectedLocationName={selectedLocationName}
        ></MapOverlay>
      </MapComponent>
    </div>
  );
}

export default HomePage;
