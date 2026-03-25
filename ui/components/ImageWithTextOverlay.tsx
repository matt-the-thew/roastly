import Image from "next/image";
import { LargeNumberLike } from "node:crypto";

interface Dimensions {
  width: number;
  height: number;
}

interface ImageWithTextOverlayProps {
  src: string;
  text?: string;
  alt: string;
  className?: string;
  size: Dimensions;
}

export default function ImageWithTextOverlay({
  src,
  text = "",
  alt,
  className,
  size,
}: ImageWithTextOverlayProps) {
  return (
    <div className={className}>
      <div className="w-full max-w-150 h-[80vw] max-h-150 overflow-hidden relative justify-self-center">
        <Image
          width={size.width}
          height={size.height}
          src={src}
          alt={alt}
          className="w-full h-full object-cover object-center"
        ></Image>
        <div className="bg-[rgba(253,218,152,0.54)] w-full absolute bottom-5 left-0 p-4 pl-15">
          <h1 className="text-white font-display text-2xl">{text}</h1>
        </div>
      </div>
    </div>
  );
}
