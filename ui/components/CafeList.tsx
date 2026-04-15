import { MouseEventHandler, useEffect, useState } from "react";
import DropdownMenu from "./DropdownMenu";

export interface Props {
  children: React.ReactNode;
  numberOfCafes?: number;
  sendUIStateData: Function;
  sendCityStateData: Function;
}

export default function CafeList({
  children,
  numberOfCafes,
  sendUIStateData,
  sendCityStateData,
}: Props) {
  const [selectedCity, setSelectedCity] = useState("Los Angeles");

  function recieveCityStateData(value: string): void {
    setSelectedCity(value);
  }

  useEffect(() => {
    if (selectedCity) {
      sendCityStateData(selectedCity);
    }
  }, [selectedCity]);

  return (
    <div>
      <div className="flex p-4 w-full">
        <div className="relative grow">
          <DropdownMenu sendStateData={recieveCityStateData}></DropdownMenu>
        </div>
        <h1 className="text-sm text-foreground font-mono font-bold p-4 text-right">
          {numberOfCafes ? numberOfCafes : `?`} cafes available
        </h1>
      </div>
      <div className="flex flex-col items-center">
        {children}
        <h2 className="text-base mt-4">...don't see your favorite cafe?</h2>
        <button
          className="text-primary text-[1rem] italic hover:underline cursor-pointer mb-[20vh]"
          onClick={() => {
            sendUIStateData("submissionForm");
          }}
        >
          suggest an addition
        </button>
      </div>
    </div>
  );
}
