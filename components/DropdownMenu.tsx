import { useState } from "react";

import { IoArrowDown } from "react-icons/io5";

const DEFAULT_CITIES: Array<string> = [
  "New York",
  "Chicago",
  "Los Angeles",
  "Seattle",
];

export interface Props {
  value: string;
  onChange: (value: string) => void;
  possibleValues?: Array<string>;
}

export default function DropdownMenu({
  value,
  onChange,
  possibleValues = DEFAULT_CITIES,
}: Props) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  function toggleMenu() {
    setMenuOpen((open) => !open);
  }

  function handleCityChange(city: string): void {
    onChange(city);
  }

  if (!menuOpen)
    return (
      <div
        className="absolute w-full p-3 bg-background border border-slate-300 rounded-md text-sm flex gap-2 items-center justify-between hover:shadow-sm cursor-pointer"
        onClick={toggleMenu}
      >
        <p className="whitespace-nowrap">{value}</p>
        <IoArrowDown></IoArrowDown>
      </div>
    );
  if (menuOpen)
    return (
      <>
        <div
          className="absolute w-full bg-background border border-slate-300 rounded-md text-sm flex flex-col items-start justify-between hover:shadow-sm cursor-pointer *:hover:bg-primary *:px-3 *:py-3 z-1"
          onClick={toggleMenu}
        >
          <p className="w-full grow bg-background">{value}</p>
          {Array.from(possibleValues).map((city, index) => {
            if (city !== value) {
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
