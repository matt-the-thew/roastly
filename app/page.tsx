"use client";
import * as React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Grid } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <>
      <Grid minH="100dvh" templateRows="auto 1fr auto">
        <Navbar />
        <HeroSection />
        <Footer />
      </Grid>
    </>
  );
}
