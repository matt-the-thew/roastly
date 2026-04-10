"use client";
import { useRef } from "react";
import Navbar from "@/ui/components/Navbar";
import Link from "next/link";
import Button from "@/ui/components/Button";
import Image from "next/image";
import Footer from "@/ui/components/Footer";
import { log } from "@/lib/logger";

log.info("Welcome to Roastly.");
log.info("<<Danger, Will Robinson!>>");

export default function LandingPage() {
  return (
    <div className="flex flex-col h-screen">
      <div>
        <Navbar />
      </div>
      <div className="w-full h-full flex grow items-center justify-center">
        <div className="flex flex-col h-full w-[65%] items-center mt-30">
          <Image
            src={"/roastly.png"}
            alt="Roastly logo"
            height={240}
            width={680}
          ></Image>
          <section className="flex flex-col md:flex-row gap-10">
            <div className="flex flex-col w-full md:w-160 justify-center">
              <h2 className="font-mono text-accent font-bold text-3xl md:text-4xl lg:ext-5xl leading-tight text-center">
                The home of coffee culture.{" "}
              </h2>
              <p className="text-3xl text-center text-foreground">
                Curated daily, just for you.
              </p>
              <p className="px-25 mt-4 text-lg leading-6.5 font-mono">
                Everyone deserves great coffee, and great coffee deserves to be
                shared. Celebrate the best cafes in your community, and all the
                people who love them as much as you do.{" "}
              </p>
            </div>
          </section>
          <div className="mt-10 grid place-items-center">
            <Image
              src={"/heromap.png"}
              height={600}
              width={600}
              alt="A picture of a map, with ambiguous markings"
              className="hidden md:inline lg:inline relative min-w-120 max-w-120 blur-xs"
            ></Image>
            <Link
              href={"#"}
              className="absolute z-10 bg-primary p-4 rounded-xl font-mono font-bold text-foreground text-2xl hover:bg-accent hover:text-background"
            >
              Browse Local Cafes
            </Link>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
