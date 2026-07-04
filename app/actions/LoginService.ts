import { browserClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  type OAuthResponse,
  type User,
} from "@supabase/supabase-js";

export class LoginService {
  /**
   * @classdesc Handles user login and registration auth flows, plus
   * automatic developer sign-in when in development env.
   * Uses {@function toast} to display promise statuses to user, as they
   * execute.
   */

  private _supabase?: ReturnType<typeof browserClient>;

  private get supabase(): ReturnType<typeof browserClient> {
    return (this._supabase ??= browserClient());
  }

  /**
   * Signs user in as "anonymous user", when in development
   * @returns {void}
   */
  async signInAsDev() {
    if (process.env.DEV_LOGIN === "true") {
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
   * client-side, can't be called in API since supabase is BaaS.
   * @param email {string} - plaintext email
   * @param password {string} - plaintext password
   * @returns {NextResponse} - Redirect to homepage
   */
  async signInWithEmail(
    email: string,
    password: string,
  ): Promise<boolean> {
    // sends data to supabase auth
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    // return error is error signing in
    if (error) {
      console.error(`[Login_Service]: ${error}`);
      return false;
    } else {
      console.log("[Login_Service]: Logged in successfully!");
      return true;
    }
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
  ): Promise<User> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}/api/auth/confirm`,
      },
    });

    if (error) {
      throw new Error(`Error creating account: ${error.message}`);
    }
    /*With email confirmation enabled, signUp returns the created user but
      NO session — so we read the user straight off the signUp response
      rather than calling getUser(), which requires an active session.*/
    if (!data.user)
      throw new Error("[Sign Up Error]: No user returned from sign up.");

    return data.user;
  }
}
