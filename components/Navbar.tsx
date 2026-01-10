"use client";
import { Box, Button, Flex, HStack, Spacer, Container } from "@chakra-ui/react";
import { LuCoffee } from "react-icons/lu";
import * as React from "react";
import Image from "next/image";

export interface INavbarProps {}

export default function Navbar(props: INavbarProps) {
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
            <LuCoffee /> Sign In
          </Button>
          <Button variant="solid">Get Started</Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
