import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import "server-only";

let client: SupabaseClient | undefined;

/**
 * Lazily creates (and caches) a supabase client with service role authority.
 * Must not be created at module load time, since Next.js evaluates route
 * modules during build-time page data collection, before env vars are
 * guaranteed to be available.
 */
export function getSupabaseSRClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return client;
}
