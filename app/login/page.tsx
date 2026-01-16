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
import { createClient } from "@/lib/supabase/client";
import { redirect, RedirectType } from "next/navigation";
import { log } from "@/lib/logger";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const supabase = createClient();

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://roastly-pi.vercel.app/auth/confirm",
      },
    });

    if (error) alert(error.message);
    else
      alert(
        "Confirmation email sent! I am going to build a modal to tell you this later.",
      );
    log.debug(`sign up recieved for ${email} : ${password}`);
    log.debug(`sending confirmation email.`);
    log.debug(`signup origin: ${window.location.origin}`);

    if (error) log.warn(error.message);
    else log.debug("Confirmation email sent!");
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    log.debug(`attempting sign in with ${email} : ${password}`);

    if (error) log.warn(error.message);
    else redirect("/logged_in", RedirectType.replace);
  };

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
          src="/logo.svg"
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
