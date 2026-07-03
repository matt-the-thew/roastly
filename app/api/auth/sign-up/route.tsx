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
      return NextResponse.json({
        status: 401,
        error: "No authorization token found.",
      });
    }
    /*Validate user JWT before allowing sign up*/
    const valid: boolean = await keyManager.validateJWT(userJWT);
    if (!valid) {
      return NextResponse.json({
        status: 401,
        error: "Invalid authorization token.",
      });
    }
    /*If JWT is explicitly valid, call sign up method*/
    if (valid) {
      await loginService.signUpWithEmailAndPassword(email, password);
      return NextResponse.json({
        status: 200,
        message: "User sign-up completed. Welcome to Roastly!",
      });
    }
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({
        status: 400,
        error: `An unknown error occurred: ${err.message}`,
      });
    } else {
      console.error("An unexpected error occurred:", err);
    }
  }
  /*Fail by default*/
  return NextResponse.json({
    status: 400,
    error: "Something went wrong.",
  });
}
