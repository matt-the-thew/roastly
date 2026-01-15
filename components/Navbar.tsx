"use client";
import { Box, Button, Flex, HStack, Spacer } from "@chakra-ui/react";
import { LuCoffee } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";
import { createKong } from "@/lib/kong";

export default function Navbar() {
  function getStartedKongInit(): void {
    createKong();
  }

  return (
    <Flex
      as="nav"
      p="20px"
      justifyContent="center"
      bg="primary"
      borderBottomColor="white"
      borderBottomWidth="2px"
    >
      <Flex w="70%">
        <Box>
          <Image src="/logo.svg" alt="Roastly logo" width={200} height={100} />
        </Box>
        <Spacer />
        <HStack gap="16px">
          <Button variant="ghost" colorScheme="gray">
            <LuCoffee />
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="solid" onClick={getStartedKongInit}>
            Get Started
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
