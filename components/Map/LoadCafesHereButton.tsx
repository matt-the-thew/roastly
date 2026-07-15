"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { BoundingBox } from "@/lib/boundingBox";
import { useMapContext } from "@/lib/MapContext";
import { registerLoadCafesClick, getJailStatus } from "@/lib/cafeRateLimit";

interface Props {
  bounds: BoundingBox;
  onLoaded: () => void;
}

export default function LoadCafesHereButton({ bounds, onLoaded }: Props) {
  const { loadCafesInBounds, isLoadingCafes } = useMapContext();
  const [jailedUntil, setJailedUntil] = useState<number | null>(null);

  useEffect(() => {
    const { jailed, jailedUntil } = getJailStatus();
    setJailedUntil(jailed ? jailedUntil : null);
  }, []);

  useEffect(() => {
    if (!jailedUntil) return;
    const interval = setInterval(() => {
      if (Date.now() >= jailedUntil) {
        setJailedUntil(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [jailedUntil]);

  async function handleClick() {
    const result = registerLoadCafesClick();
    if (!result.allowed) {
      setJailedUntil(result.jailedUntil);
      toast.error(
        "You're loading cafes too quickly. Take a short break and try again soon.",
      );
      return;
    }

    await toast.promise(loadCafesInBounds(bounds), {
      loading: "Loading cafes here",
      success: "Cafes loaded",
      error: "Problem loading cafes",
    });
    onLoaded();
  }

  if (jailedUntil) {
    const secondsLeft = Math.max(
      0,
      Math.ceil((jailedUntil - Date.now()) / 1000),
    );
    return (
      <button
        type="button"
        disabled
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 rounded-full bg-red-400 px-4 py-2 text-sm font-medium text-gray-600 shadow-md cursor-not-allowed"
      >
        Try again in {secondsLeft}s
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoadingCafes}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 rounded-full bg-primary px-4 py-2 text-sm font-medium text-gray-50 shadow-md hover:underline disabled:opacity-60 cursor-pointer"
    >
      {isLoadingCafes ? "Loading cafes…" : "Load cafes here"}
    </button>
  );
}
