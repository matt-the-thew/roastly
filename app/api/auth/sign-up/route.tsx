"use server";
import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { LoginService, SignUpError } from "@/app/actions/LoginService";
import { BetaKeyManager } from "@/app/actions/BetaKeyManager";
import { serverClient } from "@/lib/supabase/server";

/**
 * Handles form submission from /auth/sign-up/ account creation form.
 * Tests JWT to see if user is signing up with a validated beta key.
 * @param formData - sign up form data
 * @throws Will throw an error if there is backend problem with account
 * creation, or if a user is created, but no session is instantialized.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Cookie-aware client so any session established during sign-up is written
  // to the response cookies (harmless when email confirmation defers the
  // session, correct when it does not).
  const loginService = new LoginService(await serverClient());
  const keyManager = new BetaKeyManager();

  const data = await request.json();
  const { email, password } = data;
  /* Verify user JWT exists in request*/
  try {
    const userJWT = data.beta_redeem;
    if (!userJWT) {
      return NextResponse.json(
        { error: "No authorization token found." },
        { status: 401 },
      );
    }
    /*Validate user JWT before allowing sign up*/
    const valid: boolean = await keyManager.validateJWT(userJWT);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid authorization token." },
        { status: 401 },
      );
    }
    /*If JWT is explicitly valid, call sign up method*/
    if (valid) {
      await loginService.signUpWithEmailAndPassword(email, password);
      return NextResponse.json(
        { message: "User sign-up completed. Welcome to Roastly!" },
        { status: 200 },
      );
    }
  } catch (err) {
    // A SignUpError carries Supabase's real status + a user-facing message, so
    // a weak-password 422 reaches the client AS a 422 with an actionable
    // reason instead of being flattened into a generic 400. This is the fix
    // for the "sign-up fails silently" symptom.
    if (err instanceof SignUpError) {
      console.error(
        `[AUTH/SIGN-UP]: ${err.message} (code=${err.code ?? "n/a"}, status=${err.status})`,
      );
      return NextResponse.json(
        { error: err.userMessage },
        { status: err.status },
      );
    }
    if (err instanceof Error) {
      console.error(`[AUTH/SIGN-UP]: ${err.message}`);
      return NextResponse.json(
        { error: `An unexpected error occurred: ${err.message}` },
        { status: 400 },
      );
    }
    console.error("[AUTH/SIGN-UP]: An unexpected non-error was thrown:", err);
  }
  /*Fail by default*/
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}
