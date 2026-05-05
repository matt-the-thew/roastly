import Image from "next/image";

export interface Props {
  rating?: number;
  reviewCount?: number;
}

export function ratingImageGenerator(
  place: number,
  rating: number,
): React.ReactNode {
  if (rating >= place) {
    return (
      <Image
        src={"/coffee_mug_rating_present.webp"}
        alt="A full coffee cup"
        width={30}
        height={30}
        className="w-8 h-8"
      ></Image>
    );
  } else {
    return (
      <Image
        src={"/coffee_mug_rating_absent.webp"}
        alt="An empty coffee cup"
        width={30}
        height={30}
        className="w-8 h-8"
      ></Image>
    );
  }
}

export default function CafeListRating({ rating, reviewCount }: Props) {
  if (!rating) {
    return (
      <div className="font-bold">
        Not yet rated.{" "}
        <span className="text-primary hover:underline">Rate this cafe.</span>
      </div>
    );
  } else {
    return (
      <div className="flex h-8">
        {ratingImageGenerator(1, rating)}
        {ratingImageGenerator(2, rating)}
        {ratingImageGenerator(3, rating)}
        {ratingImageGenerator(4, rating)}
        {ratingImageGenerator(5, rating)}
        <p className="text-sm italic self-end text-[#747474] ml-1.5">
          ({reviewCount})
        </p>
      </div>
    );
  }
}
