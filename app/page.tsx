"use client";
import { useRef } from "react";
import Navbar from "@/ui/components/LandingPage/Navbar";
import LandingHeroSection from "@/ui/components/LandingPage/LandingHeroSection";
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
        <LandingHeroSection />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
