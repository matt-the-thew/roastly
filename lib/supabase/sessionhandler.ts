import { AuthApiError } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { log } from "@/utils/logger";
import { JwtPayload } from "@supabase/supabase-js";

export default class SessionHandler {
  user: JwtPayload | undefined;
  request: NextRequest | undefined;

  public constructor(
    private supabaseUrl: string,
    private supabasePublishableKey: string,
  ) {
    this.supabaseUrl = supabaseUrl;
    this.supabasePublishableKey = supabasePublishableKey;
  }

  async updateSession(request: NextRequest): Promise<NextResponse | void> {
    try {
      const supabase = createServerClient(
        this.supabaseUrl,
        this.supabasePublishableKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value),
              );

              const supabaseResponse = NextResponse.next({
                request,
              });

              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options),
              );
            },
          },
        },
      );
      const supabaseResponse = NextResponse.next(this.request);

      const { data, error } = await supabase.auth.getClaims();

      log.debug(
        "[SessionHandler]: auth check:" +
          JSON.stringify({
            path: request.nextUrl.pathname,
            hasClaims: Boolean(data?.claims),
            userId: data?.claims?.sub ?? null,
            error: error?.message ?? null,
          }),
      );

      this.user = data?.claims;

      return supabaseResponse;
    } catch (err) {
      if (err instanceof Error) {
        log.error(`[SessionHandler]: an unknown error occurred ${err}`);
      }
      if (err instanceof AuthApiError) {
        log.debug(`[SessionHandler]: No user detected, ${err}`);
      }
    }
  }
}
