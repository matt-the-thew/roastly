"use client";
import { Box, Flex, HStack, Spacer, Text } from "@chakra-ui/react";
import { GrSettingsOption } from "react-icons/gr";
import { LuCircleUserRound } from "react-icons/lu";
import Image from "next/image";
import { useState, useEffect } from "react";
import generateUserName from "@/utils/username-placeholder";

export default function Navbar() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!userName) {
      setUserName(generateUserName());
    }
  });

  return (
    <Flex
      as="nav"
      p="20px"
      justifyContent="center"
      bg="primary"
      borderBottomColor="white"
      borderBottomWidth="2px"
    >
      <Flex w="95%">
        <Box>
          <Image
            src={"/logo.svg"}
            alt="Roastly logo"
            width={145.891}
            height={49.594}
          />
        </Box>
        <Spacer />
        <HStack gap="26px">
          <LuCircleUserRound className="w-8 h-8" />
          <Text>{userName}</Text>
          <GrSettingsOption className="w-7 h-7 hover:cursor-pointer hover:text-gray-50"></GrSettingsOption>
        </HStack>
      </Flex>
    </Flex>
  );
}
