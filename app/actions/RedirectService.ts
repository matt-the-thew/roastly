import { type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  CONFIRMATION_ROUTES,
} from "@/lib/protectedRoutes";
import { NextURL } from "next/dist/server/web/next-url";

/**
 * Handles user session authorization in the context of protected routes and redirects.
 */
export class RedirectService {
  requestPath;
  requestUrl: NextURL;

  /**
   * @constructor
   * @param requestPath {string} - the path of the user request, excluding the domain name.
   * @param requestUrl {NextURL} - the full url of the user request, including the domain name.
   */
  constructor(requestPath: string, requestUrl: NextURL) {
    this.requestPath = requestPath;
    this.requestUrl = requestUrl;
  }

  /**
   * Checks to see if a user is onboarded (has a `profiles` row).
   * @param supabase - The request-bound server client (from `SessionHandler`).
   *   Session reads must use the middleware client — `serverClient()` relies on
   *   `next/headers`, which is unavailable in middleware.
   * @param userId - The authenticated user's id (JWT `sub` claim).
   * @throws {Error} - Must be called with a user id from an existing session.
   * @returns {Promise<boolean>}
   */
  async isOnboarded(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<boolean> {
    if (!userId)
      throw new Error(
        "[isOnboarded]: Must be called on an existing user session",
      );
    const profile = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    return Boolean(profile.data);
  }

  /* --- ROUTING UTILITY FUNCTIONS --- */

  /**
   * Checks if request url is trying to access a protected route
   * See {@file lib/protectedRoutes.ts}
   * @returns {boolean}
   */
  isProtectedRoute(): boolean {
    if (
      PROTECTED_ROUTES.some((route: string): boolean =>
        this.requestPath.startsWith(route),
      )
    )
      return true;
    else return false;
  }

  /**
   * Checks if request url is trying to access a login/signup route
   * See {@link AUTH_ROUTES}
   * @returns {boolean}
   */
  isAuthRoute(): boolean {
    if (
      AUTH_ROUTES.some((route: string): boolean =>
        this.requestPath.startsWith(route),
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks if the request is for an informational email-confirmation screen
   * (see {@link CONFIRMATION_ROUTES}). These are exempt from the auth-route
   * redirect so a just-confirmed, not-yet-onboarded user can actually see the
   * "email verified" / "check your email" pages instead of being bounced.
   * @returns {boolean}
   */
  isConfirmationRoute(): boolean {
    return CONFIRMATION_ROUTES.some((route: string): boolean =>
      this.requestPath.startsWith(route),
    );
  }

  /**
   * Checks if the request is for the onboarding page itself. Used to give the
   * "not onboarded → redirect to onboarding" rule a base case: without it, a
   * logged-in-but-profileless user requesting `/onboarding` is redirected to
   * `/onboarding` forever (ERR_TOO_MANY_REDIRECTS). The route is `/onboarding`
   * (a top-level page), NOT `/auth/onboarding` — the previous path never
   * matched, so the guard was dead.
   * @returns {boolean}
   */
  isOnboardingRoute(): boolean {
    return this.requestPath.startsWith("/onboarding");
  }

  /**
   * Builds a redirect to `path`, carrying over any auth cookies that were
   * refreshed on `sessionResponse` (from `SessionHandler`). Without this, a
   * session refreshed during the request would be dropped on the redirect.
   * @param path - The pathname to redirect to.
   * @param sessionResponse - The session-carrying response to copy cookies from.
   * @returns {NextResponse}
   */
  private buildRedirect(
    path: string,
    sessionResponse?: NextResponse,
  ): NextResponse {
    this.requestUrl.pathname = path;
    const redirect = NextResponse.redirect(this.requestUrl);
    sessionResponse?.cookies
      .getAll()
      .forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  /**
   * @returns {NextResponse} onboarding redirect server response
   */
  onboardingRedirect(sessionResponse?: NextResponse): NextResponse {
    return this.buildRedirect("/onboarding", sessionResponse);
  }

  /**
   * @returns {NextResponse} login redirect server response
   */
  loginRedirect(sessionResponse?: NextResponse): NextResponse {
    return this.buildRedirect("/auth/login", sessionResponse);
  }

  /**
   * @returns {NextResponse} map page redirect server response
   */
  homepageRedirect(sessionResponse?: NextResponse): NextResponse {
    return this.buildRedirect("/dashboard/homepage", sessionResponse);
  }

  redirectTo(path: string, sessionResponse?: NextResponse): NextResponse {
    return this.buildRedirect(path, sessionResponse);
  }
}
