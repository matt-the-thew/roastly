import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { log } from "@/lib/logger";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  log.debug(`sign up recieved for ${email} : ${password}`);
  log.debug(`sending confirmation email.`);
  log.debug(`signup origin: ${origin}, thus link --> ${origin}/auth/confirm`);

  if (error) {
    log.warn(error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    log.debug("Confirmation email sent!");
    return NextResponse.json({ success: true });
  }
}
