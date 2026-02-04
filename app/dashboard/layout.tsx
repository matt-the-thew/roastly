"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import { ChakraProvider } from "@chakra-ui/react";
import { roastlySystem } from "@/ui/theme";
import "dotenv/config";
import { Martian_Mono } from "next/font/google";

const martianMono = Martian_Mono({
  variable: "--font-martian",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={martianMono.variable} lang="en" suppressHydrationWarning>
      <body>
        <ChakraProvider value={roastlySystem}>{children}</ChakraProvider>
      </body>
    </html>
  );
}
