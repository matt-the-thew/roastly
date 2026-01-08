"use client";
import * as React from "react";
import Logo from "../components/Logo";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { Martian_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
const primaryFont = Martian_Mono();

export interface IAppProps {}

export default class LandingPage extends React.Component<IAppProps> {
  public render() {
    return (
      <>
        <Navbar />
      </>
    );
  }
}
