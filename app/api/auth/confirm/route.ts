"use server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Searches request parameters for either a code or token hash,
 * which vaires based on Supabase version. Dynamically calls either
 * (`supabase.auth.exchangeCodeForSession`)[https://supabase.com/docs/reference/javascript/auth-setsession],
 * or
 * (`supabase.auth.verifyOtp`)[https://supabase.com/docs/guides/auth/auth-email-passwordless?queryGroups=language&language=js#step-2-verify-the-otp-to-create-a-session].
 *
 * @param request - Request to parse auth parameters from.
 * @returns {Error} if auth session can't be established from `request`.
 */
async function verifyToken(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType;
  const supabase = await serverClient();

  if (code) {
    const { error } = await supabase!.auth.exchangeCodeForSession(code);
    if (!error) return;
    else {
      throw new Error(
        `[AUTH/CONFIRM]: error exchanging code for session: ${error.message}`,
      );
    }
  } else if (token_hash && type) {
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

/**
 * Handles email confirmation request, using {@link verifyToken}.
 * If `verifyToken` throws an error, redirects to `/auth/login`.
 * If logged in user has no profile, sends them to onboarding.
 * Otherwise, directs user to the homepage.
 * @param request - Email confirmation request.
 */
export async function GET(request: NextRequest) {
  try {
    await verifyToken(request);
  } catch (err: unknown) {
    // Log the real reason verbosely so a failed confirmation is diagnosable
    // from the Vercel logs, and always redirect to login with a marker so the
    // failure isn't silent (the login page surfaces `?error=confirmation_failed`
    // as a toast). Handles non-Error throws too, so we never fall through to
    // the success path below on a failed verify.
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[AUTH/CONFIRM]: token verification failed: ${message}`);
    redirect("/auth/login?error=confirmation_failed");
  }

  // Check if user exists, and if so send them to confirmed-email screen
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(
      `${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}/auth/confirmed-email`,
    );
  }

  // defaults to sending user to the homepage
  redirect("/dashboard/homepage");
}
