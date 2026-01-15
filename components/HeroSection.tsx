"use client";
import * as React from "react";
import {
  Heading,
  HStack,
  VStack,
  Flex,
  Text,
  Image,
  Box,
  Button,
} from "@chakra-ui/react";

export default function HeroSection() {
  const [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <Flex
        as="section"
        bg="primary"
        justifyContent="center"
        alignItems="center"
        p="20"
      >
        <VStack w="1/3" minW="600px" textAlign="left">
          <Heading size="7xl" fontFamily="body" fontWeight="500">
            Get it while it's{" "}
            <Text as="span" color="white">
              hot.
            </Text>
          </Heading>
          <Heading size="4xl" textDecor="underline" fontWeight="400">
            find quality coffee houses, interesting people, and your next
            favorite roast.
          </Heading>
          <Box w="100%">
            <Button variant="solid" borderRadius="20px" p="6" mt="8" ml="20">
              browse local cafes
            </Button>
          </Box>
        </VStack>
        <Box>
          <Image
            src="/heromap.png"
            alt="A map of a city with several locations marked."
            height={587}
            width={587}
          />
        </Box>
      </Flex>
    </>
  );
}
