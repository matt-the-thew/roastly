"use client";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Spacer,
  HStack,
} from "@chakra-ui/react";
import * as React from "react";

export interface INavbarProps {}

export function Navbar(props: INavbarProps) {
  return (
    <Flex as="nav" p="20px" alignItems="center" bg="yellow.fg">
      <Heading as="h1" color="yellow.focusRing" size="3xl">
        Roastly
      </Heading>
      <Spacer />

      <HStack gap="20px">
        <Box bg="gray.200" p="10px" borderRadius="6px">
          M
        </Box>
        <Text color="yellow.focusRing">useremail@email.com</Text>
        <Button variant="surface" bg="white">
          log out
        </Button>
      </HStack>
    </Flex>
  );
}
