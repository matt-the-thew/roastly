import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { log } from "@/lib/logger";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  log.debug(`sign in recieved for ${email} : ${password}`);

  if (error) {
    log.warn(error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    return NextResponse.json({ success: true });
  }
}
