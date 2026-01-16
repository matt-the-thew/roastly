"use client";
import { Box, Button, Flex, HStack, Spacer } from "@chakra-ui/react";
import { LuCoffee } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
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
          <Image
            src="/logo.svg"
            alt="Roastly logo"
            width={145.891}
            height={49.594}
          />
        </Box>
        <Spacer />
        <HStack gap="16px">
          <Button variant="ghost" colorScheme="gray">
            <LuCoffee />
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="solid">Get Started</Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
