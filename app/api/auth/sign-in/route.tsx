"use server";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email: string = formData.get("email") as string;
  const password: string = formData.get("password") as string;
  console.log("email pass:", email, password);

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required for sign-in." },
      { status: 400 },
    );
  }

  // Create supabase client instance
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password: password as string,
  });

  // Return error if supabase throws error, or if no user data found
  if (error || !data.user) {
    return NextResponse.json(
      { error: error ? `${error.message}` : "No user data was recieved." },
      { status: 400 },
    );
  }

  // Return success if no errors are thrown
  return NextResponse.json(
    {
      message: `Authentication successful, signed in as ${data.user}`,
    },
    { status: 200 },
  );
}
