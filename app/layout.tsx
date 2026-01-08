"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import LandingPage from "./page";
import { roastlySystem } from "@/ui/theme";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ChakraProvider value={roastlySystem}>
          <LandingPage />
        </ChakraProvider>
      </body>
    </html>
  );
}
