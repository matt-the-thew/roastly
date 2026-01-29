import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ENVIRONMENT } from "@/proxy";

export async function createClient() {
  const cookieStore = await cookies();

  if (ENVIRONMENT === "LOCAL") {
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
  } else if (ENVIRONMENT === "STAGING") {
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
  } else if (ENVIRONMENT === "PRODUCTION") {
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
