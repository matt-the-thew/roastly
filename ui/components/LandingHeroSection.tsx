"use client";
import Image from "next/image";
import Button from "./Button";

export default function LandingHeroSection() {
  return (
    <div className="font-display w-screen h-[80vh] bg-cream flex items-center justify-center">
      <div className="flex flex-col h-full w-[65%] justify-center items-center gap-18">
        <section className="w-60vw flex gap-10">
          <div className="flex flex-col gap-6 w-200 justify-center">
            <h2 className="text-slate-900 text-7xl/20 font-medium">
              Get it while it's <span className="text-slate-50">hot.</span>
            </h2>
            <p className="text-xl">
              Find quality coffee houses, interesting people, and your next
              favorite roast.
            </p>
            <div className="flex justify-center">
              <div className="w-[40%]">
                <Button
                  content="browse local cafes"
                  linkTo="/dashboard/homepage"
                />
              </div>
            </div>
          </div>
          <div>
            <Image
              src="/heromap.png"
              alt="A map of a city with several locations marked."
              height={587}
              width={587}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
