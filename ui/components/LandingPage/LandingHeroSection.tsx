"use client";
import Image from "next/image";
import Button from "../Button";

export default function LandingHeroSection() {
  return (
    <div className="font-display w-full h-full bg-cream flex grow items-center justify-center">
      <div className="flex flex-col h-full w-[65%] justify-center items-center gap-18">
        <section className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col gap-6 w-full md:w-160 justify-center">
            <h2 className="text-slate-900 text-3xl md:text-6xl lg:ext-7xl leading-tight font-medium">
              Get it while it's <span className="text-slate-50">hot.</span>
            </h2>
            <p className="text-md md:text-xl lg:text-2xl">
              Find quality coffee houses, interesting people, and your next
              favorite roast.
            </p>
            <div className="w-[40%]">
              <Button
                content="browse local cafes"
                linkTo="/dashboard/homepage"
              />
            </div>
          </div>
          <div>
            <Image
              src="/heromap.png"
              alt="A map of a city with several locations marked."
              height={587}
              width={587}
              className="hidden md:inline-block lg:inline-block"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
