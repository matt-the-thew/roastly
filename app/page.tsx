"use client";
import Navbar from "@/ui/components/Navbar";
import LandingHeroSection from "@/ui/components/LandingHeroSection";
import Footer from "@/ui/components/Footer";
import { log } from "@/utils/logger";

log.info("Welcome to Roastly.");
log.info("<<Danger, Will Robinson!>>");

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col grow">
      <Navbar />
      <LandingHeroSection />
      <Footer />
    </div>
  );
}
