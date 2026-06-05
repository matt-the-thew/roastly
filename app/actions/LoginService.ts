import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";
import toast from "react-hot-toast";
import {
  type OAuthResponse,
  type UserResponse,
} from "@supabase/supabase-js";

export class LoginService {
  /**
   * @classdesc Handles user login and registration auth flows, plus
   * automatic developer sign-in when in development env.
   * Uses {@function toast} to display promise statuses to user, as they
   * execute.
   */

  supabase = createClient();

  /**
   * Signs user in as "anonymous user", when in development
   * @returns {void}
   */
  async signInAsDev() {
    if (process.env.NODE_ENV === "development") {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      // if already logged in, fail
      if (session) return;

      // sign in as a blank user for dev purposes
      await this.supabase.auth.signInAnonymously();
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
    // sends data to supabase auth
    const { error } = await this.supabase.auth.signInWithPassword({
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
    return toast.promise(
      this.supabase.auth.signInWithOAuth({
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

  /**
   * Checks if user exists and has an account.
   * @returns {boolean}
   */
  async checkNewUser(): Promise<boolean> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    /*If user not in DB*/
    if (!user) return false;

    /*If user exists, see if they have a profile in DB */
    const { data: profile, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    /*Handle output of supabase function*/
    if (error) throw new Error(`[LOGIN_SERVICE]: ${error}`);
    if (profile) return true;

    /*Default to false for security against uncaught edge cases*/
    return false;
  }

  /**
   * Signs up a new user with email and password, using OTP magic-link.
   * Handles email and password in plaintext, so must be called server-side
   * after encrypted FormData is captured.
   * @param email {string} - Email in plaintext.
   * @param password {string} - Password in plaintext.
   * @returns {User} - Supabase user object, from
   * {@function supabase.auth.getUser}
   * @throws Will throw errors if {@function supabase.auth.signUp} throws
   * errors, or if signUp completes and no user session is detected.
   */
  async signUpWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserResponse> {
    const { error } = await this.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}/api/auth/confirm`,
      },
    });

    if (error) {
      throw new Error(`Error creating account: ${error}`);
    }
    const user = this.supabase.auth.getUser();
    if (!user)
      throw new Error("[Sign Up Error]: No user detected after sign up.");

    return user;
  }
}
