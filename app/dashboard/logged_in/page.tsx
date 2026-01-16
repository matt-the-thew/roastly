import * as React from "react";
import { Heading, Container, Image } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default async function LoggedIn() {
  const supabase = createClient();

  return (
    <>
      <Container w="20rem" mx="auto" mt="30vh">
        <Heading>You are logged in.</Heading>
        <Image
          src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGtvcXN0YWhtdmc1Ym5nb3hvaHBpb3NnMnBqdTQ1YnBtbm5zMWk5ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Bb3MlNHhcG45G/giphy.gif"
          alt="a gif of Donkey Kong dancing."
          borderRadius="1000px"
          mt="2rem"
        ></Image>
      </Container>
    </>
  );
}
