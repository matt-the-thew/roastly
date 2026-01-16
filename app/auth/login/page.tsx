"use client";
import {
  Image,
  Heading,
  HStack,
  Button,
  Separator,
  VStack,
  Field,
  Input,
  Container,
  Box,
} from "@chakra-ui/react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { log } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const supabase = createClient();

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    log.debug(`sending confirmation email.`);

    if (error) {
      log.warn(error.message);
    } else {
      log.debug("Confirmation email sent!");
    }
  }

  async function signIn() {
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    log.debug(`sign in recieved for ${email} : ${password}`);

    if (error) {
      log.warn(error.message);
    } else {
    }
  }

  function handleAppleClick(): void {
    log.debug("you're trying to sign in with apple.");
  }

  function handleGoogleClick(): void {
    log.debug("you're trying to sign in with google.");
  }

  return (
    <Container w="25rem" pt="20vh">
      <Box
        display="flex"
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        w="100%"
      >
        <Image
          src={"/logo.svg"}
          alt="Roastly logo"
          width={145.891}
          height={49.594}
        />

        <Heading mx="auto" p="2">
          Sign In
        </Heading>
      </Box>
      <HStack justifyContent="center">
        <Button variant="outline" size="sm" px="14" onClick={handleAppleClick}>
          <FaApple />
          Apple
        </Button>
        <Button variant="outline" size="sm" px="14" onClick={handleGoogleClick}>
          <FcGoogle />
          Google
        </Button>
      </HStack>
      <Separator my="4" />
      <VStack>
        <Field.Root>
          <Input
            placeholder="me@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Input
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field.Root>
      </VStack>
      <HStack pt="4" w="100%" justifyContent="center">
        <Button variant="solid" onClick={signIn}>
          Sign In
        </Button>
        <Button variant="outline" onClick={signUp}>
          Sign Up
        </Button>
      </HStack>
    </Container>
  );
}
