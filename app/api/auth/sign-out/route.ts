"use server";
import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";

/**
 * Server-side sign-out.
 *
 * The browser client can only delete auth cookies it can see and match via
 * `document.cookie`. Cookies (or chunks) written by the server/middleware with
 * specific options can be left orphaned by a browser-side delete — a stale
 * chunk that later fails validation and wedges the session. Signing out through
 * the server client runs the delete through `@supabase/ssr`'s own cookie
 * adapter, emitting `Set-Cookie` removals with the matching options for every
 * `sb-*` auth chunk.
 *
 * `scope: "local"` clears the local session without a network revoke that would
 * throw when the session is already invalid — the whole point here is to
 * guarantee the cookies are cleared even from a broken session.
 */
export async function POST() {
  try {
    const supabase = await serverClient();
    await supabase.auth.signOut({ scope: "local" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[AUTH/SIGN-OUT]: ${message}`);
  }
  return NextResponse.json({ success: true });
}
