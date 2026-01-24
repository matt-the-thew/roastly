import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { log } from "./lib/logger";

export default async function proxy(request: NextRequest) {
  log.debug("[PROXY]: awaiting updateSession");
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
