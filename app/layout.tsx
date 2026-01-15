"use client";
import { ChakraProvider } from "@chakra-ui/react";
import { roastlySystem } from "@/ui/theme";
import "dotenv/config";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ChakraProvider value={roastlySystem}>{children}</ChakraProvider>
      </body>
    </html>
  );
}
