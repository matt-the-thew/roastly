import { useState } from "react";

import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import Image from "next/image";

export interface Props {
  imageRefs?: Array<string>;
}

function paginationDisplayInjector(index: number): React.ReactNode {
  return (
    <div className={`flex gap-0.5  p-2`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <button
          key={i}
          className={`
            h-3 w-3 border-2 border-white rounded-4xl duration-200
            ${i === index ? "bg-white" : ""}`}
          aria-current={i === index}
        />
      ))}
    </div>
  );
}

//TODO: Implement logic to pull & list images based on locations from cloud storage
export function ImageCarousel({ imageRefs }: Props) {
  const [currentImage, setCurrentImage] = useState<number>(1);

  function handleCarouselRight(): void {
    let stateParser = currentImage;
    stateParser < 5 ? (stateParser += 1) : stateParser;
    setCurrentImage(stateParser);
  }

  function handleCarouselLeft(): void {
    let stateParser = currentImage;
    stateParser > 0 ? (stateParser -= 1) : stateParser;
    setCurrentImage(stateParser);
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-sm">
      <Image
        src={currentImage % 2 == 0 ? "/donkeymonkey.jpg" : "/cafe_ex.jpg"}
        alt="cafe interior"
        width={200}
        height={200}
        className="object-cover w-full h-full"
      />
      <div className="absolute top-[45%] w-full flex justify-between">
        <button
          className="w-fit h-10 bg-[#eaeaea] rounded-4xl p-3 mx-2 flex items-center justify-center cursor-pointer text-black hover:shadow-xl active:border"
          onClick={handleCarouselLeft}
        >
          <IoIosArrowBack className="text-lg" />
        </button>
        <button
          className="w-fit h-10 bg-[#eaeaea] rounded-4xl p-3 mx-2 flex items-center justify-center cursor-pointer text-black hover:shadow-xl active:border"
          onClick={handleCarouselRight}
        >
          <IoIosArrowForward className="text-lg" />
        </button>
      </div>
      <div className="absolute bottom-0 w-full flex justify-center">
        {paginationDisplayInjector(currentImage)}
      </div>
    </div>
  );
}
