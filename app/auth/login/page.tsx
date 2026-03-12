"use client";
import { redirect } from "next/navigation";
import Form from "next/form";
import Image from "next/image";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { log } from "@/utils/logger";
import { createClient } from "@/lib/supabase/client";
import Button from "@/ui/components/Button";
import { sign } from "crypto";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const supabase = createClient();

  async function signIn() {
    try {
      console.log(email);
      console.log(password);
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

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://127.0.0.1:3000/auth/confirm",
      },
    });
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
      <div className="w-[60%] flex flex-col *:mt-2">
        <label htmlFor="email">Email:</label>
        <input
          className="border border-gray-200 rounded-md p-2"
          type="text"
          id="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <label htmlFor="password">Password:</label>
        <input
          className="border border-gray-200 rounded-md p-2"
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <div className="flex flex-col gap-4 justify-around">
          <Button variant="ghost" content="Sign In" clickEvent={signIn} />
          <Button content="Sign Up" linkTo="sign-up" />
          <Button content="Google OAuth" clickEvent={signInWithGoogle} />
        </div>
      </div>
    </div>
  );
}
