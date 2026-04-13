import Image from "next/image";
import CafeListRating from "@/ui/components/CafeListRating";

export interface Props {
  title: string;
  distance?: number;
  rating?: number;
  reviewCount?: number;
  description?: string;
  image?: string;
}

export default function App({
  title,
  distance,
  rating,
  reviewCount = 0,
  description,
  image,
}: Props) {
  return (
    <div className="flex gap-3 w-[98%] h-70 p-2 mb-0 border-b border-[#eaeaea] hover:bg-[#dadada] duration-95 cursor-pointer">
      <div className="w-[50%] flex flex-col">
        <div className="flex justify-between">
          <h1 className="text-lg font-bold">{title}</h1>
          <h1 className="text-lg text-[#747474]">
            {distance ? distance : "?"} mi
          </h1>
        </div>
        <CafeListRating
          rating={rating}
          reviewCount={reviewCount}
        ></CafeListRating>
        {!description && (
          <p className="text-sm mt-0.5 italic">
            We're having trouble finding this cafe's description.
            <br></br>
            <span className="text-primary hover:underline font-bold">
              Tell us about it.
            </span>
          </p>
        )}
        {description && <p className="text-sm mt-3">{description}</p>}
      </div>
      <div className="w-[50%] h-[95%] self-center">
        <Image
          src={!image ? "/cafe_ex.jpg" : image}
          alt="A cafe interior, from a low angle."
          width={612}
          height={408}
          className="h-full object-cover rounded-lg"
        ></Image>
      </div>
    </div>
  );
}
