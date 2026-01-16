import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { log } from "./lib/logger";

export default async function middleware(request: NextRequest) {
  log.debug("[MIDDLEWARE]: awaiting updateSession");
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon|heromap|logo).*)"],
};
