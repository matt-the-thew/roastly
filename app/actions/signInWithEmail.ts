import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";
import toast from "react-hot-toast";

/**
 * Handles login form data to sign in with email and password
 * @param formData - Login form submission data
 */
export async function signInWithEmail(
  formData: FormData,
): Promise<NextResponse | Error> {
  // create a new supabase client
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  // send data to supabase auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  // return error is error signing in
  if (error) {
    toast.error("There was a problem logging in. Please try again.");
    return new Error(`${error}`);
  } else toast.success("Logged in successfully!");
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}/dashboard/homepage`,
  );
}
