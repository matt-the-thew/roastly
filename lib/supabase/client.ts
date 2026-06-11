import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";
/**
 * Creates browser client instance using {@function createBrowserClient}
 * from {@import supabase/ssr}. Requires public supabase URL, and the
 * supabase publishable key.
 * @returns {SupabaseClient}
 */
export function browserClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_PUBLISHABLE_KEY!,
  );
}
