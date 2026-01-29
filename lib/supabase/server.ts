import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  if (process.env.DEPLOY_ENVIRONMENT === "LOCAL") {
    return createServerClient(
      `${process.env.NEXT_PUBLIC_LOCAL_SUPABASE_URL}`,
      `${process.env.NEXT_PUBLIC_LOCAL_SUPABASE_PUBLISHABLE_KEY}`,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    );
  } else if (process.env.DEPLOY_ENVIRONMENT === "STAGING") {
    return createServerClient(
      `${process.env.NEXT_PUBLIC_ROASTLY_DEV_SUPABASE_URL}`,
      `${process.env.NEXT_PUBLIC_ROASTLY_DEV_SUPABASE_PUBLISHABLE_KEY}`,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    );
  } else if (process.env.DEPLOY_ENVIRONMENT === "PRODUCTION") {
    return createServerClient(
      `${process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_URL}`,
      `${process.env.NEXT_PUBLIC_ROASTLY_SUPABASE_PUBLISHABLE_KEY}`,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    );
  }
}
