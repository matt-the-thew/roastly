import Image from "next/image";
import CafeListRating from "@/components/CafeList/CafeListRating";
import { Location } from "@/lib/fetchLocations";
import { useMapContext } from "@/lib/MapContext";

export interface Props {
  title: string;
  distance?: number;
  rating?: number;
  reviewCount?: number;
  description?: string;
  image?: string;
  location: Location;
}

export default function CafeListEntry({
  title,
  distance,
  rating,
  reviewCount = 0,
  description,
  image,
  location,
}: Props) {
  const { setSelectedLocation } = useMapContext();

  return (
    <div
      className="flex gap-3 w-[98%] h-60 p-2 mb-0 border-b border-[#eaeaea] hover:bg-[#f8f8f8] duration-95 cursor-pointer"
      onClick={() => setSelectedLocation(location)}
    >
      <div className="w-[50%] flex flex-col">
        <div className="flex justify-between">
          <h1 className="text-base font-bold">{title}</h1>
          <h1 className="w-10 text-sm text-[#747474]">
            {distance ? distance : "?"} mi
          </h1>
        </div>
        <div className="">
          <CafeListRating rating={rating} reviewCount={reviewCount} />
        </div>
        {!description && (
          <p className="text-sm mt-0.5 italic">
            We're having trouble finding this cafe's description.
            <br />
            <span className="text-primary hover:underline font-bold">
              Tell us about it.
            </span>
          </p>
        )}
        {description && (
          <p className="text-sm mt-3 line-clamp-4">{description}</p>
        )}
      </div>
      <div className="w-[50%] h-full">
        <Image
          src={!image ? "/cafe_ex.jpg" : image}
          alt="A cafe interior, from a low angle."
          width={612}
          height={408}
          className="h-full object-cover rounded-lg"
        />
      </div>
    </div>
  );
}
