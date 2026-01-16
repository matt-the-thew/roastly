"use client";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Grid } from "@chakra-ui/react";
import { createClient } from "@/lib/supabase/client";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments } = await supabase.from("instruments").select();

  console.log(JSON.stringify(instruments, null, 2));
}
import { log } from "@/lib/logger";

log.info("Welcome to Roastly.");

export default function HomePage() {
  InstrumentsData();
  return (
    <Grid minH="100dvh" templateRows="auto 1fr auto">
      <Navbar />
      <HeroSection />
      <Footer />
    </Grid>
  );
}
