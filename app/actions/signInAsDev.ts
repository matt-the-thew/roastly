import { createClient } from "@/lib/supabase/client";

export const signInAsDev = async () => {
  if (process.env.NODE_ENV === "development") {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    // if already logged in, fail
    if (session) return;

    // sign in as a blank user for dev purposes
    await supabase.auth.signInAnonymously();
    console.log("Signing in as Developer");
  }
};
