"use client";
import {
  Box,
  Button,
  Flex,
  HStack,
  Spacer,
  Container,
  Dialog,
  CloseButton,
  Field,
  Input,
  Separator,
  VStack,
} from "@chakra-ui/react";
import { LuCoffee } from "react-icons/lu";
import * as React from "react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

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
          <Dialog.Root placement="center" motionPreset="slide-in-bottom">
            <Dialog.Trigger asChild>
              <Button variant="ghost" colorScheme="gray">
                <LuCoffee /> Sign In
              </Button>
            </Dialog.Trigger>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" _hover={{ bg: "gray.300" }} />
                </Dialog.CloseTrigger>
                <Dialog.Header flexDir="column" alignItems="center" mt="10">
                  <Image
                    src="/logo.svg"
                    alt="Roastly logo"
                    width={150}
                    height={75}
                  />
                  <Dialog.Title mx="auto" p="2">
                    Sign In
                  </Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <HStack justifyContent="center">
                    <Button variant="outline" size="sm" px="14">
                      <FaApple />
                      Apple
                    </Button>
                    <Button variant="outline" size="sm" px="14">
                      <FcGoogle />
                      Google
                    </Button>
                  </HStack>
                  <Separator my="4" />
                  <VStack>
                    <Field.Root>
                      <Input placeholder="me@example.com" />
                    </Field.Root>
                    <Field.Root>
                      <Input placeholder="password" />
                    </Field.Root>
                  </VStack>
                  <HStack pt="4" w="100%" justifyContent="center">
                    <Button variant="solid">Sign In</Button>
                    <Button variant="outline">Sign Up</Button>
                  </HStack>
                </Dialog.Body>
                <Dialog.Footer />
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>

          <Button variant="solid">Get Started</Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
