"use client";
import Navbar from "../components/Navbar";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import { LoginService } from "./actions/LoginService";
import { useEffect } from "react";

console.log("Welcome to Roastly.");
console.log("<<Danger, Will Robinson!>>");

/*
 * Exports the Landing Page of the Roastly Site
 */
export default function LandingPage() {
  useEffect(() => {
    (async function () {
      const login = new LoginService();
      // login.signInAsDev();
    })();
  }, []);
  return (
    <div className="flex flex-col h-screen">
      <div>
        <Navbar />
      </div>
      <div className="w-full h-fi flex grow items-center justify-center">
        <div className="flex flex-col h-full w-[65%] items-center mt-30">
          <Image
            src={"/branding/roastly-logo.svg"}
            alt="Roastly logo"
            height={240}
            width={680}
            loading="eager"
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
                Everyone deserves great coffee, and great coffee deserves
                to be shared. Celebrate the best cafes in your community,
                and all the people who love them just as much as you
                do.{" "}
              </p>
            </div>
          </section>
          <div className="mt-10 grid place-items-center">
            <Image
              src={"/images/map-with-icons.png"}
              height={600}
              width={600}
              loading="eager"
              alt="A picture of a map, with ambiguous markings"
              className="hidden md:inline lg:inline relative w-120 h-auto blur-xs"
            ></Image>
            <Link
              href={"/dashboard/homepage"}
              className="absolute bg-primary p-4 rounded-xl font-mono font-bold text-foreground text-2xl hover:bg-accent hover:text-background"
            >
              Browse Local Cafes
            </Link>
          </div>
        </div>
      </div>
      <div className="">
        <Footer />
      </div>
    </div>
  );
}
