"use client";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Grid } from "@chakra-ui/react";
import { log } from "@/lib/logger";
import { ENVIRONMENT } from "@/proxy";

log.info("Welcome to Roastly.");
if (ENVIRONMENT === "STAGING") {
  log.debug(`STORED SITE URL: ${process.env.NEXT_PUBLIC_ROASTLY_DEV_SITE_URL}`);
} else if (ENVIRONMENT === "PRODUCTION") {
  log.debug(`STORED SITE URL: ${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}`);
} else if (ENVIRONMENT === "LOCAL") {
  log.debug(`STORED SITE URL: ${process.env.NEXT_PUBLIC_LOCAL_SITE_URL}`);
}

export default function HomePage() {
  return (
    <Grid minH="100dvh" templateRows="auto 1fr auto">
      <Navbar />
      <HeroSection />
      <Footer />
    </Grid>
  );
}
