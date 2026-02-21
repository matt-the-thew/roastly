import { Flex, Button, HStack } from "@chakra-ui/react";
import * as React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <Flex
        as="footer"
        bg="secondary"
        h="100%"
        minH="50px"
        justifyContent="center"
        borderTopColor="white"
        borderTopWidth="2px"
      >
        <HStack justifyContent="center" gap="12">
          <Button variant="ghost">Store</Button>
          <Button variant="ghost">Status</Button>
          <Link href="/about">
            <Button variant="ghost">About</Button>
          </Link>
          <Button variant="ghost">Terms</Button>
          <Button variant="ghost">Rules</Button>
          <Button variant="ghost">Help</Button>
        </HStack>
      </Flex>
    </>
  );
}
