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
      return error.message || "There was a problem creating your account.";
  }
}

/**
 * Translates a Supabase sign-*in* {@link AuthError} into a friendly, specific
 * message for end users.
 *
 * Differs from {@link friendlyAuthMessage} in two deliberate ways:
 *  1. **No verbatim fallback.** Sign-up echoes Supabase's own message for
 *     unmapped codes; sign-in must not. Leaking the server's raw error
 *     vocabulary on an unauthenticated endpoint widens the attack surface by
 *     making internal states observable, so unknown codes collapse to one
 *     opaque, generic string.
 *  2. **No user enumeration.** Supabase already returns a single
 *     `invalid_credentials` code for both "wrong password" and "no such
 *     account"; we preserve that ambiguity rather than splitting it, so an
 *     attacker can't probe which emails are registered.
 * @param error - The Supabase auth error from `signInWithPassword`.
 * @returns {string} - A user-facing message, safe to display as-is.
 */
export function friendlyLoginMessage(error: AuthError): string {
  /*Transport failures (Supabase unreachable, DNS/CORS, offline) surface through
    supabase-js as an AuthRetryableFetchError with no auth `code` and status 0,
    NOT as a thrown exception — so catch them here rather than letting them fall
    through to the generic default. This is a connectivity problem, and saying
    so is more actionable than "try again in a moment".*/
  if (error.name === "AuthRetryableFetchError" || error.status === 0) {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  switch (error.code) {
    case "invalid_credentials":
      return "The email or password you entered is incorrect.";
    case "email_not_confirmed":
      return "Please confirm your email before signing in — check your inbox for the confirmation link.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many sign-in attempts. Please wait a minute and try again.";
    case "user_banned":
      return "This account has been suspended. Contact support if you believe this is a mistake.";
    case "email_address_invalid":
    case "validation_failed":
      return "Please enter a valid email address.";
    default:
      return "We couldn't sign you in right now. Please try again in a moment.";
  }
}

/**
 * Outcome of {@link LoginService.signInWithEmail}. A discriminated union so the
 * caller can branch on `ok` and — on failure — read a display-ready `message`
 * plus the stable Supabase `code` (used to drive UI affordances such as a
 * "resend confirmation" link, never rendered verbatim).
 */
export type SignInResult =
  { ok: true } | { ok: false; message: string; code?: string };

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
   *
   * Returns a {@link SignInResult} rather than a bare boolean so the caller can
   * tell the user *why* a sign-in failed. The raw Supabase error is logged
   * (with its code) for debugging but never returned to the browser — only the
   * sanitised message from {@link friendlyLoginMessage} crosses the boundary.
   * @param email {string} - plaintext email
   * @param password {string} - plaintext password
   * @returns {Promise<SignInResult>} - `{ ok: true }` on success, otherwise a
   * display-ready message and the Supabase error code.
   */
  async signInWithEmail(
    email: string,
    password: string,
  ): Promise<SignInResult> {
    // sends data to supabase auth
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      /*Log the full error server-side/console for diagnostics; surface only a
        sanitised, code-driven message to the user.*/
      console.error(
        `[Login_Service]: ${error.code ?? "unknown"} — ${error.message}`,
      );
      return {
        ok: false,
        message: friendlyLoginMessage(error),
        code: error.code,
      };
    }

    console.log("[Login_Service]: Logged in successfully!");
    return { ok: true };
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
