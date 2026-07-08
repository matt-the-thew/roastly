import { browserClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  type AuthError,
  type OAuthResponse,
  type User,
  type SupabaseClient,
} from "@supabase/supabase-js";

/**
 * Error thrown by {@link LoginService.signUpWithEmailAndPassword} that carries
 * enough context for the API layer to answer the client honestly instead of
 * masking every failure as a generic 400. `message` stays log-oriented (and
 * keeps the `Error creating account` prefix the tests assert on); `userMessage`
 * is a friendly, user-facing string; `status` is Supabase's own HTTP status so
 * a `weak_password` 422 reaches the browser as a 422, not a 400.
 */
export class SignUpError extends Error {
  readonly status: number;
  readonly userMessage: string;
  readonly code?: string;

  constructor(
    message: string,
    opts: { status: number; userMessage: string; code?: string },
  ) {
    super(message);
    this.name = "SignUpError";
    this.status = opts.status;
    this.userMessage = opts.userMessage;
    this.code = opts.code;
  }
}

/**
 * Translates a Supabase {@link AuthError} into a friendly, specific message for
 * end users. Falls back to Supabase's own message for cases we don't special-
 * case, so nothing is ever swallowed. Keyed on the stable `error.code` rather
 * than the (localised, changeable) message text.
 * @param error - The Supabase auth error.
 * @returns {string} - A user-facing message.
 */
export function friendlyAuthMessage(error: AuthError): string {
  switch (error.code) {
    case "weak_password":
      return (
        "Your password must be at least 8 characters and include a lowercase " +
        "letter, an uppercase letter, a number, and a symbol."
      );
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Try logging in instead.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a minute and try again.";
    case "signup_disabled":
      return "Sign-ups are currently disabled. Please try again later.";
    case "email_address_invalid":
    case "validation_failed":
      return "Please enter a valid email address.";
    default:
      return (
        error.message || "There was a problem creating your account."
      );
  }
}

export class LoginService {
  /**
   * @classdesc Handles user login and registration auth flows, plus
   * automatic developer sign-in when in development env.
   * Uses {@function toast} to display promise statuses to user, as they
   * execute.
   */

  private _supabase?: SupabaseClient;

  /**
   * @param supabase - Optional pre-built Supabase client that decides which
   * runtime this instance persists sessions to. **Server route handlers must
   * pass `await serverClient()`** (from `lib/supabase/server.ts`) so the
   * session is written to the response cookies. Client components can omit
   * this and get the cookie-syncing browser client by default. Passing a
   * plain `createClient` here would persist to `localStorage` and be
   * invisible to the middleware — don't.
   */
  constructor(supabase?: SupabaseClient) {
    this._supabase = supabase;
  }

  private get supabase(): SupabaseClient {
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
  async signInWithEmail(email: string, password: string): Promise<boolean> {
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
      throw new SignUpError(`Error creating account: ${error.message}`, {
        status: error.status ?? 400,
        userMessage: friendlyAuthMessage(error),
        code: error.code,
      });
    }
    /*With email confirmation enabled, signUp returns the created user but
      NO session — so we read the user straight off the signUp response
      rather than calling getUser(), which requires an active session.*/
    if (!data.user)
      throw new Error("[Sign Up Error]: No user returned from sign up.");

    return data.user;
  }
}
