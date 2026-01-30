import { type NextRequest } from "next/server";
import SessionHandler from "./lib/supabase/sessionhandler";
import { log } from "./lib/logger";

const sessionHandlerInstance = new SessionHandler(
  `${process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL}`,
  `${process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_PUBLISHABLE_KEY}`,
);

export default async function proxy(request: NextRequest) {
  log.debug("[PROXY]: awaiting updateSession");
  await sessionHandlerInstance.updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
