"use client";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    toast.promise(
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/confirm` },
      }),
      {
        loading: "Signing in with Google…",
        success: "Redirecting…",
        error: "Sign-in failed",
      },
    );
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push("/dashboard/homepage");
  }

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="w-120 mt-[20vh] rounded-2xl border border-gray-200 flex flex-col items-center p-10 gap-6 h-fit">
        <Link href={"/"}>
          <Image
            src={"/logo.svg"}
            alt="Roastly logo"
            width={145.891}
            height={49.594}
            className="w-50"
          />
        </Link>

        <button onClick={signInWithGoogle} className="cursor-pointer w-[80%]">
          <Image
            src={"/web_light_sq_ctn@4x.png"}
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

        <form onSubmit={signInWithEmail} className="w-full flex flex-col gap-3">
          <input
            className="border border-gray-200 rounded-md p-2 w-full"
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border border-gray-200 rounded-md p-2 w-full"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <Link href="/auth/sign-up" className="hover:underline text-primary">
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
