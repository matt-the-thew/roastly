"use client";
import Navbar from "@/ui/components/Navbar";
import LandingHeroSection from "@/ui/components/LandingHeroSection";
import Footer from "@/ui/components/Footer";
import { log } from "@/utils/logger";

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
