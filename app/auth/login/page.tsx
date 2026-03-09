"use client";
import { redirect } from "next/navigation";
import Image from "next/image";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { log } from "@/utils/logger";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const supabase = createClient();

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}/auth/confirm`,
      },
    });

    log.debug(`SIGNUP DATA: ${JSON.stringify(data)}`);

    if (error) {
      log.warn(`SIGNUP ERROR: ${error.message}`);
    }
  }

  async function signIn() {
    try {
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
      log.debug(`sign in recieved for ${email} `);
    } catch (err) {
      if (err instanceof Error) {
        alert("There was a problem signing in.");
        return log.error(
          `[SIGNUP]: There was a problem signing in ${err.message}`,
        );
      }
      redirect("/dashboard/homepage");
    }
  }

  function handleAppleClick(): void {
    log.debug("you're trying to sign in with apple.");
  }

  function handleGoogleClick(): void {
    log.debug("you're trying to sign in with google.");
  }

  return (
    <div className="w-120 h-150 rounded-2xl border border-gray-200 m-auto mt-[20vh] flex flex-col items-center">
      <Image
        src={"/logo.svg"}
        alt="Roastly logo"
        width={145.891}
        height={49.594}
        className="w-50 mt-10"
      />
    </div>
  );
}
