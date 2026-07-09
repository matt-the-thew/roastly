import { NextRequest, NextResponse } from "next/server";
import { RedirectService } from "./app/actions/RedirectService";
import { SessionHandler } from "./lib/supabase/sessionhandler";

/* REDIRECTS:
 * If a user session exists, the user is onboarded, and the user tries to access:
 * ["/auth/login", "/auth/sign-up", "/verify-email", "/confirmed-email"], contained in
 * AUTH_ROUTES, send them to "/dashboard/homepage".
 *
 * If a user session exists, and the user is not onboarded, and they try to access
 * ANY route, redirect them to "/onboarding".
 *
 * If a user session does not exist, and the user tries to access any one of the protected
 * routes in PROTECTED_ROUTES, send them to "/auth/login".
 *
 * Route variables are fed into app/actions/RedirectService.ts from lib/protectedRoutes.ts
 */

/**
 * Executes before any request is completed. Handles redirection logic for protected routes,
 * as well as defining what protected routes are.
 * @param request
 * @returns {NextResponse | undefined}
 */
export default async function proxy(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  // clone the request url and mutate the pathname property for redirects
  const requestUrl = request.nextUrl.clone();
  const rs = new RedirectService(requestUrl.pathname, requestUrl);

  // Load/refresh the session from the request cookies. This is the ONLY
  // Supabase client wiring that works in middleware — bound to the NextRequest,
  // not the browser (`document.cookie`) or server-component (`next/headers`)
  // cookie stores. `sessionResponse` carries any refreshed auth cookies.
  const handler = new SessionHandler(
    process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_PUBLISHABLE_KEY!,
  );
  const sessionResponse = await handler.updateSession(request);
  const userId = handler.user?.sub;
  const supabase = handler.supabase!;

  //TODO: Add beta key gate on all protected routes

  // The email-confirmation screens (verify-email, confirmed-email) are
  // informational and must render regardless of session/onboarding state. In
  // particular the confirmation link opens confirmed-email in a *second* tab
  // for a just-confirmed, not-yet-onboarded user — without this exemption the
  // auth-route block below would bounce that tab to /onboarding, recreating the
  // double-onboarding race the confirmed-email page exists to prevent.
  if (rs.isConfirmationRoute()) {
    return sessionResponse;
  }

  // Protect auth routes: an onboarded, logged-in user shouldn't see login/signup.
  if (rs.isAuthRoute()) {
    if (userId) {
      const onboarded = await rs.isOnboarded(supabase, userId);
      // if user isn't onboarded, send them to onboarding
      if (!onboarded) {
        return rs.onboardingRedirect(sessionResponse);
      }
      // finally, if onboarded user session exists send to homepage
      return rs.homepageRedirect(sessionResponse);
    }
  }

  if (rs.isProtectedRoute()) {
    if (!userId) {
      // if no user session exists, send to login
      return rs.loginRedirect(sessionResponse);
    }
    // if a user session exists, check if user is onboarded
    const onboarded = await rs.isOnboarded(supabase, userId);
    // Send an un-onboarded user to onboarding — but NOT when they are already
    // ON /onboarding. /onboarding is itself a protected route, so without this
    // base case the redirect targets the same page it fired from and loops
    // forever (ERR_TOO_MANY_REDIRECTS). A logged-in, profileless user must be
    // allowed to render /onboarding so they can create their profile.
    if (!onboarded && !rs.isOnboardingRoute()) {
      return rs.onboardingRedirect(sessionResponse);
    }
  }

  // 2c. Beta key gate — only on protected routes
  // if (isProtectedRoute()) {
  //   const { data: used_by } = await supabase
  //     .from("beta_keys")
  //     .select("used_by")
  //     .eq("id", user.id)
  //     .maybeSingle();

  //   if (!used_by) {
  //     return NextResponse.redirect(new URL("/auth/login", request.url));
  //   }
  // }
  // }

  // Pass through, returning the session-carrying response so any refreshed auth
  // cookies are written back to the browser.
  return sessionResponse;
}

/* NextJS proxy instructions to ignore execution on requests to included
   paths. */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
