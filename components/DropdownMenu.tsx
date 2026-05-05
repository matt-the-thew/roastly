import { useEffect, useState } from "react";

import { IoArrowDown } from "react-icons/io5";

export interface Props {
  possibleValues?: Array<string>;
  sendStateData: (value: string) => void;
}

export default function DropdownMenu({ sendStateData }: Props) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<string>("Los Angeles");
  const possibleValues: Array<string> = [
    "New York",
    "Chicago",
    "Los Angeles",
    "Seattle",
  ];

  useEffect(() => {
    if (currentCity) {
      sendStateData(currentCity);
    }
  }, [currentCity]);

  function toggleMenu() {
    menuOpen ? setMenuOpen(false) : setMenuOpen(true);
  }

  function handleCityChange(city: string): void {
    setCurrentCity(city);
  }

  if (!menuOpen)
    return (
      <div
        className="absolute w-full p-3 bg-background border border-slate-300 rounded-md text-sm flex gap-2 items-center justify-between hover:shadow-sm cursor-pointer"
        onClick={toggleMenu}
      >
        <p className="whitespace-nowrap">{currentCity}</p>
        <IoArrowDown></IoArrowDown>
      </div>
    );
  if (menuOpen)
    return (
      <>
        <div
          className="absolute w-full bg-background border border-slate-300 rounded-md text-sm flex flex-col items-start justify-between hover:shadow-sm cursor-pointer *:hover:bg-primary *:px-3 *:py-3"
          onClick={toggleMenu}
        >
          <p className="w-full grow bg-background">{currentCity}</p>
          {Array.from(possibleValues).map((city, index) => {
            if (city !== currentCity) {
              return (
                <p
                  className="w-full bg-background"
                  key={index}
                  onClick={() => {
                    handleCityChange(city);
                  }}
                >
                  {city}
                </p>
              );
            }
          })}
        </div>
      </>
    );
}
