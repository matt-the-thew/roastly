"use server";
import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { LoginService } from "@/app/actions/LoginService";
import { BetaKeyManager } from "@/app/actions/BetaKeyManager";

/**
 * Handles form submission from /auth/sign-up/ account creation form.
 * Tests JWT to see if user is signing up with a validated beta key.
 * @param formData - sign up form data
 * @throws Will throw an error if there is backend problem with account
 * creation, or if a user is created, but no session is instantialized.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const loginService = new LoginService();
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
    if (err instanceof Error) {
      console.error(`[AUTH/SIGN-UP]: ${err.message}`);
      return NextResponse.json(
        { error: `An unknown error occurred: ${err.message}` },
        { status: 400 },
      );
    } else {
      console.error("An unexpected error occurred:", err);
    }
  }
  /*Fail by default*/
  return NextResponse.json(
    { error: "Something went wrong." },
    { status: 400 },
  );
}
