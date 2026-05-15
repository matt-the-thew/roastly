"use client";
import { useEffect, useState } from "react";
import { ImageCarousel } from "../ImageCarousel";
import { useMapContext } from "@/lib/MapContext";
import LikeButton from "./LikeButton";
import FriendAttribution from "../Social/FriendAttribution";
import {
  getCafeImages,
  getPublicUrl,
  type CafeImage,
} from "@/lib/supabase/images";

export default function CafeDetails() {
  const { selectedLocation, setOverlayView, setSelectedLocation } =
    useMapContext();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedLocation) return;
    setImages([]);
    getCafeImages(selectedLocation.name).then((imgs: CafeImage[]) => {
      setImages(imgs.map((img) => getPublicUrl(img.storage_path)));
    });
  }, [selectedLocation?.name]);

  if (!selectedLocation) return null;

  return (
    <div className="w-full h-full p-7 pt-10 flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setOverlayView("cafeList");
            setSelectedLocation(null);
          }}
          className="bg-[#eaeaea] w-20 h-5 rounded-sm font-bold hover:bg-[#676767] cursor-pointer"
        >
          return
        </button>
      </div>

      <div className="flex justify-between items-start">
        <h1 className="text-[1.5rem] font-bold">{selectedLocation.name}</h1>
      </div>

      <div className="flex items-center justify-between">
        <LikeButton cafeId={selectedLocation.name} />
        {/* <div className="relative">
          TODO: Implement Tags in DB, and make them appear here dynamically
          Could wait until after launch, this is not critical MVP...
          <CafeTagList />
        </div> */}
      </div>

      <FriendAttribution cafeId={selectedLocation.name} />

      <div className="h-70">
        <ImageCarousel images={images} />
      </div>

      <h2 className="text-lg font-bold mt-2">About</h2>
      <div className="pr-4">
        <p className="text-[0.95rem] leading-7">
          {selectedLocation.description}
        </p>
      </div>
    </div>
  );
}
