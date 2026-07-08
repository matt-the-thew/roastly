import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";
/**
 * Creates a browser client instance using {@function createBrowserClient}
 * from {@import @supabase/ssr}. Requires the public Supabase URL and the
 * Supabase publishable key.
 *
 * Use this ONLY from client components / browser-executed code. The browser
 * client syncs the auth session into `document.cookie`, which is what lets
 * the Next.js middleware (`proxy.ts` → `SessionHandler`) and the server
 * client (`serverClient`) read the same session. A plain `createClient` from
 * `@supabase/supabase-js` would persist to `localStorage` instead and be
 * invisible to that cookie-based layer — do not swap it out for one.
 *
 * Server route handlers / server components must use `serverClient()` from
 * `lib/supabase/server.ts` instead, which is bound to the `next/headers`
 * cookie store and writes `Set-Cookie` onto the response.
 * @returns {SupabaseClient}
 */
export function browserClient(): SupabaseClient {
  let client: SupabaseClient;
  try {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_PUBLISHABLE_KEY!,
    );
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`[lib/supabase/client.ts]: ${err.message}`);
    } else {
      throw new Error(
        "[lib/supabase/client.ts]: Error creating supabase client. An unknown error occured.",
      );
    }
  }
  return client;
}
