"use client";
import Navbar from "@/components/Navbar";
import LandingHeroSection from "@/components/LandingHeroSection";
import Footer from "@/components/Footer";
import { log } from "@/utils/logger";

log.info("Welcome to Roastly.");
log.debug(`STORED SITE URL: ${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}`);

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col grow">
      <Navbar />
      <LandingHeroSection />
      <Footer />
    </div>
  );
}
