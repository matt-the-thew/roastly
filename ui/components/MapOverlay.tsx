import { useEffect, useState } from "react";

import CafeSubmissionForm from "./CafeSubmissionForm";
import CafeList from "./CafeList";
import CafeListEntry from "@/ui/components/CafeListEntry";
import CafeDetails from "./CafeDetails";

import { Location } from "@/lib/fetchLocations";

import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

interface Props {
  selectedLocationName: string | null;
  sendCityStateData: Function;
  locations: Array<Location>;
}

export default function MapOverlay({
  selectedLocationName,
  sendCityStateData,
  locations,
}: Props) {
  const [hidden, setHidden] = useState<boolean>(false);
  const [selectedCafe, setSelectedCafe] = useState<Location | null>(null);
  const [renderState, setRenderState] = useState<string>("cafeList");
  const [selectedCity, setSelectedCity] = useState<string>("Los Angeles");

  function toggleHidden(): void {
    hidden ? setHidden(false) : setHidden(true);
  }

  function recieveStateData(value: string): void {
    setRenderState(value);
  }

  function recieveCafeSelection(location: Location) {
    setSelectedCafe(location);
  }

  function recieveCityStateData(value: string): void {
    setSelectedCity(value);
  }

  useEffect(() => {
    if (selectedCafe && renderState !== "cafeDetails") {
      setRenderState("cafeDetails");
    }
    console.log(
      selectedCafe?.name,
      selectedCafe?.longitude,
      selectedCafe?.latitude,
    );
  }, [selectedCafe]);

  useEffect(() => {
    if (selectedCity) {
      sendCityStateData(selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedLocationName) {
      let locationWithMatchingName = locations.find(
        ({ name }) => name == selectedLocationName,
      );

      setSelectedCafe(
        locationWithMatchingName ? locationWithMatchingName : null,
      );

      setHidden(false);
    }
  }, [selectedLocationName]);

  function handleRenderState(): React.ReactNode {
    switch (renderState) {
      case "cafeList":
        return (
          <CafeList
            numberOfCafes={locations.length}
            sendUIStateData={recieveStateData}
            sendCityStateData={recieveCityStateData}
          >
            {locations.map((location) => {
              return (
                <CafeListEntry
                  title={location.name}
                  rating={location.rating}
                  description={location.description}
                  key={location.id}
                  location={location}
                  sendCafeSelection={recieveCafeSelection}
                ></CafeListEntry>
              );
            })}
          </CafeList>
        );
      case "submissionForm":
        return (
          <CafeSubmissionForm
            sendStateData={recieveStateData}
          ></CafeSubmissionForm>
        );
      case "cafeDetails":
        return (
          <CafeDetails
            sendStateData={recieveStateData}
            location={selectedCafe}
          ></CafeDetails>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <div
        className={`fixed z-2 h-[95vh] w-113 top-[2.5vh] ${hidden ? "-left-116" : "left-8"} bg-background rounded-xl flex flex-col items-center overflow-hidden duration-300`}
      >
        <div className="overflow-auto w-full h-full">{handleRenderState()}</div>
      </div>
      <button
        className={`fixed flex items-center justify-end bg-background w-12 h-20 rounded-lg z-1 ${hidden ? "-left-5" : "left-114"} top-[45vh] cursor-pointer hover:bg-primary duration-300`}
        onClick={toggleHidden}
      >
        {hidden && (
          <IoIosArrowForward className="text-xl animate-pulse"></IoIosArrowForward>
        )}
        {!hidden && (
          <IoIosArrowBack className="text-xl animate-pulse"></IoIosArrowBack>
        )}
      </button>
    </>
  );
}
