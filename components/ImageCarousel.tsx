import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Image from "next/image";

export interface Props {
  images?: string[];
}

function PaginationDots({
  count,
  current,
}: {
  count: number;
  current: number;
}) {
  return (
    <div className="flex gap-0.5 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-3 w-3 border-2 border-white rounded-full duration-200 ${i === current ? "bg-white" : ""}`}
        />
      ))}
    </div>
  );
}

export function ImageCarousel({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const total = images?.length ?? 0;

  if (!images || total === 0) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-sm flex items-center justify-center">
        <p className="font-mono text-sm text-gray-400">No photos yet</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-sm">
      <Image
        src={images[current]}
        alt={`Cafe photo ${current + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 450px"
      />
      {total > 1 && (
        <>
          <div className="absolute top-[45%] w-full flex justify-between">
            <button
              className="w-fit h-10 bg-[#eaeaea] rounded-4xl p-3 mx-2 flex items-center justify-center cursor-pointer text-black hover:shadow-xl active:border disabled:opacity-30"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
            >
              <IoIosArrowBack className="text-lg" />
            </button>
            <button
              className="w-fit h-10 bg-[#eaeaea] rounded-4xl p-3 mx-2 flex items-center justify-center cursor-pointer text-black hover:shadow-xl active:border disabled:opacity-30"
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              disabled={current === total - 1}
            >
              <IoIosArrowForward className="text-lg" />
            </button>
          </div>
          <div className="absolute bottom-0 w-full flex justify-center">
            <PaginationDots count={total} current={current} />
          </div>
        </>
      )}
    </div>
  );
}
