"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent } from "react";
import { useState } from "react";
import { LoginService } from "@/app/actions/LoginService";
import { useRouter } from "next/navigation";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const loginService = new LoginService();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const formDataObject = Object.fromEntries(formData.entries());

    try {
      const login = await loginService.signInWithEmail(
        formDataObject.email as string,
        formDataObject.password as string,
      );

      /*Handle uncertain failure mode */
      if (!login) {
        throw new Error("An unknown error occurred.");
      } else {
        router.push(
          `${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}/dashboard/homepage`,
        );
      }
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        throw new Error(`[Login_Error]: ${err.message}`);
      } else {
        throw new Error(`[Login_Error]: An unknown error occurred ${err}`);
      }
    }
    setLoading(false);
  };

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
        {/*<button
          onClick={login.signInWithGoogle}
          className="cursor-pointer w-[80%]"
        >
          <Image
            src={"/images/google-signin-button.png"}
            alt="Sign in with Google"
            width={756}
            height={160}
            className="hover:shadow-lg active:border-2"
          />
        </button>*/}
        {/*
        <div className="flex items-center w-full gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400 font-mono">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
*/}
        {/* Sign in with email & password */}
        <form
          name="sign-in"
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-3"
        >
          <input
            className="border border-gray-200 rounded-md p-2 w-full"
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="username"
            required
          />
          <input
            className="border border-gray-200 rounded-md p-2 w-full"
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            className="bg-primary text-white rounded-md p-2 font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
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
