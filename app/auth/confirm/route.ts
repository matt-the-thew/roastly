import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { log } from "@/lib/logger";

/*Searches parameters for either code or token hash,
which varies based on Supabase version. Based on what it finds, 
calls the respectively correct function and handles errors.
*/
async function verifyToken(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType;
  const supabase = await createClient();

  if (code) {
    log.debug("[AUTH/CONFIRM]: using legacy token");
    const { error } = await supabase!.auth.exchangeCodeForSession(code);
    if (!error) return;
    throw new Error(
      `[AUTH/CONFIRM]: error exchanging code for session: ${error.message}`,
    );
  } else if (token_hash && type) {
    log.debug("[AUTH/CONFIRM]: using Auth v2");
    const { error } = await supabase!.auth.verifyOtp({
      token_hash: token_hash,
      type: type,
    });
    if (!error) return;
    throw new Error(`[AUTH/CONFIRM]: error verifying otp: ${error.message}`);
  } else {
    throw new Error("[AUTH/CONFIRM]: No token or token_hash found");
  }
}

// function getSanitizedNextPath(request: NextRequest): string {
//   const { searchParams } = new URL(request.url);
//   const nextPath = searchParams.get("next") ?? "/";
//   return nextPath.startsWith("/") ? nextPath : "/";
// }

export async function GET(request: NextRequest) {
  log.debug(JSON.stringify(request));

  try {
    await verifyToken(request);
  } catch (err: unknown) {
    if (err instanceof Error) {
      log.debug(`[AUTH/CONFIRM]: Error verifying token: ${err.message}`);
      redirect("/auth/auth-code-error");
    }
  }
  log.debug("[AUTH/CONFIRM]: Token verified");
  redirect("/dashboard/homepage");
}
