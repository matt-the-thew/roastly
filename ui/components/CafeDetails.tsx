import CafeListRating from "./CafeListRating";
import { ImageCarousel } from "./ImageCarousel";
import { Location } from "@/lib/fetchLocations";
import CafeTagList from "./CafeTagList";

export interface Props {
  distance?: number;
  reviewCount?: number;
  rating?: number;
  description?: string;
  image?: string;
  location: Location | null;
  sendStateData: Function;
}

export default function CafeDetails({
  distance,
  reviewCount,
  description,
  image,
  location,
  sendStateData,
}: Props) {
  return (
    <div className="w-full h-full p-7 pt-10 flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          onClick={() => {
            sendStateData("cafeList");
          }}
          className="bg-[#eaeaea] w-20 h-5 rounded-sm font-bold hover:bg-[#676767] cursor-pointer"
        >
          return
        </button>
      </div>
      <div className="flex justify-between">
        <h1 className="text-[1.5rem] font-bold">
          {location ? location.name : "Unknown, Captain..."}
        </h1>
        <h2 className="text-[1.3rem] italic text-[#747474]">
          {distance ? `${distance} mi` : "? mi"}
        </h2>
      </div>
      <div className="py-4 flex justify-between">
        <CafeListRating
          rating={location?.rating}
          reviewCount={0}
        ></CafeListRating>
        <div className="relative">
          <CafeTagList></CafeTagList>
        </div>
      </div>
      <div className="h-70">
        <ImageCarousel></ImageCarousel>
      </div>
      <h2 className="text-lg font-bold mt-2">About</h2>
      <div className="pr-4">
        <p className="text-[0.95rem] leading-7">{location?.description}</p>
      </div>
    </div>
  );
}
