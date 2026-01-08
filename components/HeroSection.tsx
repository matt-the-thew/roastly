"use client";
import * as React from "react";
import { Button, HStack } from "@chakra-ui/react";
import { Drawer } from "@chakra-ui/react";

export default function HeroSection() {
  const [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <HStack>
        <Button size="lg" variant="outline" onClick={() => setOpen(true)}>
          Hello, world!
        </Button>
      </HStack>

      <Drawer.Root open={isOpen} onOpenChange={(e) => setOpen(e.open)}>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Title>The Wonderful world of Bugs</Drawer.Title>
            <Drawer.Footer />
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  );
}
