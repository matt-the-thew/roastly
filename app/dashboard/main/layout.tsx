"use client";
import { ChakraProvider } from "@chakra-ui/react";
import { roastlySystem } from "@/ui/theme";
import "dotenv/config";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ChakraProvider value={roastlySystem}>{children}</ChakraProvider>;
}
