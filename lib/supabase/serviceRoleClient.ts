import { createClient } from "@supabase/supabase-js";
import "server-only";

/**
 * Creates a supabase client with service role authority
 */
export const supabaseSRClient = createClient(
  process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
