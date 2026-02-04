"use client";
import MapView from "@/components/MapView";
import { VStack } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <VStack h="100vh" w="100%">
      <MapView></MapView>
    </VStack>
  );
}
