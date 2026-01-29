import { createBrowserClient } from "@supabase/ssr";
import { ENVIRONMENT } from "@/proxy";

export function createClient() {
  if (ENVIRONMENT === "LOCAL") {
    return createBrowserClient(
      `${process.env.NEXT_PUBLIC_LOCAL_SUPABASE_URL}`,
      `${process.env.NEXT_PUBLIC_LOCAL_SUPABASE_PUBLISHABLE_KEY}`,
    );
  } else if (ENVIRONMENT === "STAGING") {
    return createBrowserClient(
      `${process.env.NEXT_PUBLIC_ROASTLY_DEV_SUPABASE_URL}`,
      `${process.env.NEXT_PUBLIC_ROASTLY_DEV_SUPABASE_PUBLISHABLE_KEY}`,
    );
  } else if (ENVIRONMENT === "PRODUCTION") {
    return createBrowserClient(
      `${process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL}`,
      `${process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_PUBLISHABLE_KEY}`,
    );
  }
}
