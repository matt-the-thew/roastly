import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { type OAuthResponse } from "@supabase/supabase-js";

export async function signInWithGoogle(): Promise<OAuthResponse> {
  const supabase = createClient();
  return toast.promise(
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
