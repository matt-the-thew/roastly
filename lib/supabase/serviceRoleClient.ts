import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import "server-only";

let client: SupabaseClient | undefined;

/**
 * Lazily creates (and caches) a supabase client with service role authority.
 * Must not be created at module load time, since Next.js evaluates route
 * modules during build-time page data collection, before env vars are
 * guaranteed to be available.
 */
export function getSupabaseSRClient(): SupabaseClient | undefined {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL;
    const secretKey = process.env.ROASTLY_SUPABASE_SECRET_KEY;

    if (!url)
      throw new Error(
        "NEXT_PUBLIC_ROASTLY_SUPABASE_URL is not set — cannot create service-role client.",
      );
    if (!secretKey)
      throw new Error(
        "ROASTLY_SUPABASE_SECRET_KEY is not set — cannot create service-role client. " +
          "This must be a Supabase secret key (sb_secret_…); a publishable/anon key will be blocked by RLS.",
      );

    try {
      client = createClient(url, secretKey);
    } catch (err) {
      if (err instanceof Error) {
        console.error("[serviceRoleClient]:", err.message);
      } else {
        console.error(
          "[serviceRoleClient]: An unknown error occurred while creating a supabase client. Check that environment variables are accurate.",
        );
      }
    }
  }
  if (client) return client;
  else return undefined;
}
