"use client";
import { useRef } from "react";
import Navbar from "@/ui/components/LandingPage/Navbar";
import Link from "next/link";
import Button from "@/ui/components/Button";
import Image from "next/image";
import Footer from "@/ui/components/LandingPage/Footer";
import { log } from "@/lib/logger";

log.info("Welcome to Roastly.");
log.info("<<Danger, Will Robinson!>>");

export default function LandingPage() {
  return (
    <div className="flex flex-col h-screen">
      <div>
        <Navbar />
      </div>
      <div className="grow">
        <div className="w-full h-full bg-cream flex grow items-center justify-center">
          <div className="flex flex-col h-full w-[65%] justify-center items-center gap-18">
            <section className="flex flex-col md:flex-row gap-10">
              <div className="flex flex-col gap-6 w-full md:w-160 justify-center">
                <h2 className="font-sans text-slate-900 text-3xl md:text-6xl lg:ext-7xl leading-tight font-medium">
                  The world's greatest cafe database.
                </h2>
                <p className="text-sm md:text-lg lg:text-xl">
                  Designed by coffee professionals and curated by experts,
                  according to{" "}
                  <Link
                    href={"/blog/the-roastly-standard"}
                    className="underline hover:italic"
                  >
                    The Roastly Standard
                  </Link>
                </p>
                <div className="w-[40%]">
                  <Button
                    content="cafes near me"
                    linkTo="/dashboard/homepage"
                  />
                </div>
              </div>
              <div></div>
            </section>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
