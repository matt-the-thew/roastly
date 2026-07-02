import Image from "next/image";
import CafeListRating from "@/components/CafeList/CafeListRating";
import { Location } from "@/lib/fetchLocations";
import { useMapContext } from "@/lib/MapContext";
import { distanceByHaversine } from "@/lib/distanceByHaversineFormula";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface Props {
  title: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  image?: string;
  location: Location;
}

export default function CafeListEntry({
  title,
  rating,
  reviewCount = 0,
  description,
  image,
  location,
}: Props) {
  const { setSelectedLocation, userLocation } = useMapContext();
  const [distanceTo, setDistanceTo] = useState<number | null>(null);

  useEffect(() => {
    if (!userLocation) {
      setDistanceTo(null);
      return;
    }

    setDistanceTo(
      distanceByHaversine([
        { lat: userLocation.latitude, lon: userLocation.longitude },
        { lat: location.latitude, lon: location.longitude },
      ]),
    );
  }, [userLocation, location.latitude, location.longitude]);

  return (
    <div className="flex gap-3 w-[98%] h-60 p-2 mb-0 border-b border-[#eaeaea] hover:bg-[#f8f8f8] duration-95 cursor-pointer">
      <div
        className="w-[50%] h-full flex flex-col"
        onClick={() => setSelectedLocation(location)}
      >
        <div className="flex justify-between">
          <h1 className="text-base font-bold">{title}</h1>
          <h1 className="w-10 text-sm text-[#747474]">
            {distanceTo ? distanceTo : "?"} mi
          </h1>
        </div>
        <div className="">
          {rating && (
            <CafeListRating rating={rating} reviewCount={reviewCount} />
          )}
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
      <div className="w-[50%] h-full relative hover:shadow-xl duration-100 rounded-lg">
        <Image
          src={!image ? "/images/placeholder-image.jpeg" : image}
          alt="A cafe interior, from a low angle."
          width={612}
          height={408}
          className="h-full object-cover rounded-lg"
        />
        <p className="absolute top-[45%] left-2 bg-background p-0.5 rounded-sm">
          No images yet!{" "}
          <Link href={"#"} className="text-primary hover:underline">
            upload an image.
          </Link>
        </p>
      </div>
    </div>
  );
}
