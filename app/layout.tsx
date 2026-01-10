"use client";
import type { Metadata } from "next";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Martian_Mono } from "next/font/google";
import LandingPage from "./page";
import { roastlySystem } from "@/ui/theme";

const martianMono = Martian_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

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
