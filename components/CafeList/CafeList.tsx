import { useEffect, useMemo, useRef, useState } from "react";
import { useMapContext } from "@/lib/MapContext";
import { Location } from "@/lib/fetchLocations";
import DropdownMenu from "../DropdownMenu";
import CafeListEntry from "./CafeListEntry";

const SEARCH_DEBOUNCE_MS = 150;
const MAX_SUGGESTIONS = 6;

function matchesQuery(location: Location, query: string): boolean {
  const haystack =
    `${location.name} ${location.description ?? ""} ${location.vibe ?? ""}`.toLowerCase();
  return haystack.includes(query);
}

export default function CafeList() {
  const { locations, setSelectedCity, setOverlayView, setSelectedLocation } =
    useMapContext();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchInput.trim().toLowerCase());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = useMemo(() => {
    if (!debouncedQuery) return locations;
    return locations.filter((location) =>
      matchesQuery(location, debouncedQuery),
    );
  }, [locations, debouncedQuery]);

  const suggestions = useMemo(() => {
    if (!debouncedQuery) return [];
    return filteredLocations.slice(0, MAX_SUGGESTIONS);
  }, [filteredLocations, debouncedQuery]);

  function handleSelectSuggestion(location: Location) {
    setSelectedLocation(location);
    setSearchInput(location.name);
    setSuggestionsOpen(false);
  }

  return (
    <div>
      <div className="flex p-4 w-full">
        <div className="relative grow">
          <DropdownMenu sendStateData={setSelectedCity} />
        </div>
        <h1 className="text-sm text-foreground font-mono font-bold p-4 text-right">
          {filteredLocations.length} cafes available
        </h1>
      </div>
      <div className="relative px-4 mb-2" ref={containerRef}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setSuggestionsOpen(true);
          }}
          onFocus={() => setSuggestionsOpen(true)}
          placeholder="Search cafes..."
          className="w-full p-3 bg-background border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {suggestionsOpen && suggestions.length > 0 && (
          <div className="absolute left-4 right-4 mt-1 bg-background border border-slate-300 rounded-md shadow-md z-10 overflow-hidden">
            {suggestions.map((location) => (
              <div
                key={location.id}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-primary"
                onClick={() => handleSelectSuggestion(location)}
              >
                {location.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center">
        {filteredLocations.map((location) => (
          <CafeListEntry
            title={location.name}
            description={location.description}
            key={location.id}
            location={location}
          />
        ))}
        <h2 className="text-base mt-4">...don't see your favorite cafe?</h2>
        <button
          className="text-primary text-[1rem] italic hover:underline cursor-pointer mb-[20vh]"
          onClick={() => setOverlayView("submissionForm")}
        >
          suggest an addition
        </button>
      </div>
    </div>
  );
}
