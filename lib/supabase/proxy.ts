import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { log } from "@/lib/logger";

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();

  log.debug(
    "[supabase proxy.ts]: auth check:" +
      JSON.stringify({
        path: request.nextUrl.pathname,
        hasClaims: Boolean(data?.claims),
        userId: data?.claims?.sub ?? null,
        error: error?.message ?? null,
      }),
  );

  const user = data?.claims;

  if (user && request.nextUrl.pathname == "/auth/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/logged_in";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
