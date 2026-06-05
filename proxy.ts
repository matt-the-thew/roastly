import { NextResponse, type NextRequest } from "next/server";
import { SessionHandler } from "./lib/supabase/sessionhandler";

const sessionHandlerInstance: SessionHandler = new SessionHandler(
  process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL!,
  process.env.ROASTLY_SUPABASE_ANON_KEY!,
);

const protectedRoutes: string[] = [
  "/dashboard/homepage",
  "/blog",
  "/settings",
  "/profile/*",
];

/**
 * Executes before any request is completed.
 * @param request - The user request.
 * @returns NextResponse.redirect if authenticated user tries to
 * access the login page.
 */
export default async function proxy(request: NextRequest) {
  await sessionHandlerInstance.updateSession(request);
  /* If authenticated user tires to access login,
     send them to dashboard. */
  if (
    sessionHandlerInstance.user &&
    request.nextUrl.pathname.startsWith("/auth/login")
  ) {
    return NextResponse.redirect(
      new URL("/dashboard/homepage", request.url),
    );
  }
  /* If unauthenticated user tries to access protectedRoutes,
     send them to login. */
  if (
    !sessionHandlerInstance.user &&
    protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route),
    )
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

/* NextJS proxy instructions to ignore execution on requests to included
   paths. */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
