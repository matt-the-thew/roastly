import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "./lib/supabase/server";

const PROTECTED_ROUTES: string[] = ["/dashboard", "/settings"];
const AUTH_ROUTES: string[] = ["/auth/login", "/auth/signup"];

/**
 * Executes before any request is completed. Handles protected routes.
 * @param request
 * @returns {NextResponse | undefined}
 */
export default async function proxy(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  console.log("[middleware]", request.nextUrl.pathname);
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const reqUrl = request.nextUrl.pathname;

  /**
   * Checks if request url is trying to access a protected route
   * See {@link PROTECTED_ROUTES}
   * @returns {boolean}
   */
  const isProtectedRoute = (): boolean => {
    if (PROTECTED_ROUTES.some((r) => reqUrl.startsWith(r))) return true;
    else return false;
  };

  /**
   * Checks if request url is trying to access a login/signup route
   * See {@link AUTH_ROUTES}
   * @returns {boolean}
   */
  const isAuthRoute = (): boolean => {
    if (AUTH_ROUTES.some((r) => reqUrl.startsWith(r))) return true;
    else return false;
  };

  /**
   * Checks is reuqest url is trying to access onboarding,
   * @returns {boolean}
   */
  const isOnboardingRoute = () => reqUrl.startsWith("/auth/onboarding");

  // 1. Not logged in -> guard protected routes
  if (!user && isProtectedRoute()) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 2. Logged in -> run user-specific checks
  if (user) {
    // 2a. Redirect away from auth pages
    if (isAuthRoute()) {
      return NextResponse.redirect(new URL("/dashboard/homepage", request.url));
    }

    // 2b. Onboarding gate — only on protected routes, not onboarding itself
    if (isProtectedRoute() && !isOnboardingRoute()) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
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
  }

  return NextResponse.next();
}

/* NextJS proxy instructions to ignore execution on requests to included
   paths. */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
