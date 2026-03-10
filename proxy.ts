import { NextResponse, type NextRequest } from "next/server";
import SessionHandler from "./lib/supabase/sessionhandler";
import { log } from "./utils/logger";

const sessionHandlerInstance = new SessionHandler(
  process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_ANON_KEY!,
);

export default async function proxy(request: NextRequest) {
  log.debug("[PROXY]: awaiting updateSession");
  await sessionHandlerInstance.updateSession(request);

  //if unauthorized user requests access to dashboard, redirect to login
  if (
    !sessionHandlerInstance.user &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    log.debug("[PROXY]: user not authorized, redirecting to login...");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  //if already authorized user tries to login, send to dashboard
  if (
    sessionHandlerInstance.user &&
    request.nextUrl.pathname.startsWith("/auth/login")
  ) {
    log.debug("[PROXY]: redirecting authorized user to dashboard...");
    return NextResponse.redirect(new URL("/dashboard/homepage", request.url));
  }
}

//ignore authentication of any kind for the following file types
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
