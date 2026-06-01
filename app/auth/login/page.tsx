"use client";
import Image from "next/image";
import Link from "next/link";
import { signInWithEmail } from "@/app/actions/signInWithEmail";
import { signInWithGoogle } from "@/app/actions/signInWithGoogle";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="w-120 mt-[20vh] rounded-2xl border border-gray-200 flex flex-col items-center p-10 gap-6 h-fit">
        <Link href={"/"}>
          <Image
            src={"/branding/roastly-logo.svg"}
            alt="Roastly logo"
            width={145.891}
            height={49.594}
            className="w-50"
          />
        </Link>

        {/* Google OAuth image & link */}
        <button
          onClick={signInWithGoogle}
          className="cursor-pointer w-[80%]"
        >
          <Image
            src={"/images/google-signin-button.png"}
            alt="Sign in with Google"
            width={756}
            height={160}
            className="hover:shadow-lg active:border-2"
          />
        </button>

        <div className="flex items-center w-full gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400 font-mono">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Sign in with email & password */}
        <form
          name="sign-in"
          onSubmit={async (e) => {
            e.preventDefault();
            signInWithEmail(new FormData(e.currentTarget));
          }}
          className="w-full flex flex-col gap-3"
        >
          <input
            className="border border-gray-200 rounded-md p-2 w-full"
            type="email"
            placeholder="Email"
            autoComplete="username"
            required
          />
          <input
            className="border border-gray-200 rounded-md p-2 w-full"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white rounded-md p-2 font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex gap-4 text-sm font-mono">
          <Link
            href="/auth/sign-up"
            className="hover:underline text-primary"
          >
            Create account
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/" className="hover:underline text-gray-500">
            Go back
          </Link>
        </div>
      </div>
    </div>
  );
}
