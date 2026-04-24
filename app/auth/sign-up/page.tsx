"use client";
import Image from "next/image";
import { useState } from "react";
import { log } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";
import Button from "@/ui/components/Button";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import Link from "next/link";

export default function SignUp() {
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

  return (
    <div className="relative w-120 h-150 rounded-2xl border border-gray-200 m-auto mt-[20vh] flex flex-col items-center">
      <Link href="/auth/login">
        <IoChevronBackCircleOutline className="absolute left-6 top-6 text-4xl text-slate-400 cursor-pointer hover:text-slate-300 duration-150" />
      </Link>
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
          <Button clickEvent={signUp}>Sign Up</Button>
        </div>
      </div>
    </div>
  );
}
