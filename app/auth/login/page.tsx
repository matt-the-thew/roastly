"use client";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { log } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";
import Button from "@/ui/components/Button";
import { sign } from "crypto";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Login() {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");

  const supabase = createClient();
  const redirectLink = `${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}`;

  // async function signIn() {
  //   try {
  //     console.log(email);
  //     console.log(password);
  //     await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });
  //     log.debug(`sign in recieved for ${email} `);
  //   } catch (err) {
  //     if (err instanceof Error) {
  //       alert("There was a problem signing in.");
  //       return log.error(
  //         `[SIGNUP]: There was a problem signing in ${err.message}`,
  //       );
  //     }
  //     redirect("/dashboard/homepage");
  //   }
  // }

  async function signInWithGoogle() {
    const promiseObject = supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    toast.promise(promiseObject, {
      loading: "Signing in with Google",
      success: "Success!",
      error: "There was a problem signing in",
    });
  }

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="w-120 h-90 mt-[30vh] rounded-2xl border border-gray-200 flex flex-col items-center">
        <Image
          src={"/logo.svg"}
          alt="Roastly logo"
          width={145.891}
          height={49.594}
          className="w-50 mt-10"
        />
        <h2 className="font-display mt-5 text-xl">Sign in with OAuth!</h2>
        <div className="h-full flex flex-col items-center">
          <button
            onClick={signInWithGoogle}
            className="cursor-pointer w-[80%] mt-[8%]"
          >
            <Image
              src={"/web_light_sq_ctn@4x.png"}
              alt="The google logo, with the text 'sign in with google'"
              width={756}
              height={160}
              className="hover:shadow-lg active:border-2"
            ></Image>
          </button>
          <Link
            href={"/"}
            className="font-display p-4 h-10 mt-4 flex justify-center items-center bg-cream rounded-md hover:shadow-lg active:border-2"
          >
            <p>Forget it</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
