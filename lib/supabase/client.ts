import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  if (process.env.DEPLOY_ENVIRONMENT === "LOCAL") {
    return createBrowserClient(
      `${process.env.NEXT_PUBLIC_LOCAL_SUPABASE_URL}`,
      `${process.env.NEXT_PUBLIC_LOCAL_SUPABASE_PUBLISHABLE_KEY}`,
    );
  } else if (process.env.DEPLOY_ENVIRONMENT === "STAGING") {
    return createBrowserClient(
      `${process.env.NEXT_PUBLIC_ROASTLY_DEV_SUPABASE_URL}`,
      `${process.env.NEXT_PUBLIC_ROASTLY_DEV_SUPABASE_PUBLISHABLE_KEY}`,
    );
  } else if (process.env.DEPLOY_ENVIRONMENT === "PRODUCTION") {
    return createBrowserClient(
      `${process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL}`,
      `${process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_PUBLISHABLE_KEY}`,
    );
  }
}
