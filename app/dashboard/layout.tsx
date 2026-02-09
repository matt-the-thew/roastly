"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { ChakraProvider } from "@chakra-ui/react";
import { roastlySystem } from "@/ui/theme";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ChakraProvider value={roastlySystem}>{children}</ChakraProvider>;
}
