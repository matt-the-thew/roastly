"use client";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Grid } from "@chakra-ui/react";
import { log } from "@/utils/logger";

log.info("Welcome to Roastly.");
log.debug(`STORED SITE URL: ${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}`);

export default function HomePage() {
  return (
    <Grid minH="100dvh" templateRows="auto 1fr auto">
      <Navbar />
      <HeroSection />
      <Footer />
    </Grid>
  );
}
