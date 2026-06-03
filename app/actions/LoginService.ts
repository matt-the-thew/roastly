import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";
import toast from "react-hot-toast";
import { type OAuthResponse } from "@supabase/supabase-js";
import { jwtVerify } from "jose";
import { supabaseSRClient } from "@/lib/supabase/serviceRoleClient";

export class LoginService {
  /**
   * @classdesc Handles user login and registration auth flows, plus
   * automatic developer sign-in when in development env.
   * Uses {@function toast} to display promise statuses to user, as they
   * execute.
   */

  async _registerWithBetaKey(redemptionJWT: string): Promise<boolean> {
    // Format secret as Uint8Array, required by jose
    const REDEMPTION_SECRET = new TextEncoder().encode(
      process.env.BETA_Key_JWT_SECRET,
    );
    let payload;
    // extract payload with secret
    try {
      const { payload: p } = await jwtVerify(
        redemptionJWT,
        REDEMPTION_SECRET,
      );
      payload = p;
    } catch (error) {
      throw new Error(`Error redeeming JWT: ${error}`);
    }

    /*Throw errors if the token is incorrect, or if it is assocaited with
    an account. Only return TRUE if both these conditions are explicitly
    met, otherwise default to FALSE */
    if (payload.purpose !== "beta_redeem")
      throw new Error("Wrong token type");

    const { data: key } = await supabaseSRClient
      .from("beta_keys")
      .select("used_by")
      .eq("id", payload.key_id)
      .single();

    if (key?.used_by !== null)
      throw new Error("Token associated with existing account");

    if (payload.purpose == "beta_redeem" && key?.used_by == null) {
      return true;
    } else return false;
  }

  /**
   * Signs user in as "anonymous user", when in development
   * @returns {void}
   */
  async signInAsDev() {
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
  }

  /**
   * Handles login data with email and password, in plaintext. To be used
   * by API after decrypting {@type FormData} from login requests
   * @param email {string} - plaintext email
   * @param password {string} - plaintext password
   * @returns {NextResponse} - Redirect to homepage
   */
  async signInWithEmail(
    email: string,
    password: string,
  ): Promise<NextResponse | Error> {
    // creates a new supabase client
    const supabase = createClient();
    // sends data to supabase auth
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

  /**
   * Calls {@function supabase.auth.signInWithOAuth}.
   * On success, redirects to "/auth/confirm".
   * @returns {Promise<OAuthResponse>}
   */
  async signInWithGoogle(): Promise<OAuthResponse> {
    const supabase = createClient();
    return toast.promise(
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}/auth/confirm`,
        },
      }),
      {
        loading: "Signing in with Google…",
        success: "Redirecting…",
        error: "Sign-in failed",
      },
    );
  }
}
