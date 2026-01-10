"use client";
import * as React from "react";
import { Martian_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Flex, Grid } from "@chakra-ui/react";
const primaryFont = Martian_Mono();

export interface IAppProps {}

export default class LandingPage extends React.Component<IAppProps> {
  public render() {
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
}
