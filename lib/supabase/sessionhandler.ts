import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { JwtPayload, type SupabaseClient } from "@supabase/supabase-js";

/** Handles creation and lifecycle of user sessions
 * @param supabaseUrl - The Supabase project url.
 * @param supabasePublishableKey - The Supabase project publishable key.
 * @property user - JWT claims for the user, if the user exists.
 * Properties listed on [Supabase's JWT Docs](https://supabase.com/docs/guides/auth/jwt-fields)
 * @property supabase - The request-bound server client. Only available after
 * `updateSession` has run; use it for any further per-request queries (e.g. the
 * onboarding profile lookup) so they share the same cookie context.
 * @property response - The response carrying any refreshed auth cookies. Return
 * it (or copy its cookies onto a redirect) so the refreshed session sticks.
 */
export class SessionHandler {
  user: JwtPayload | undefined;
  supabase: SupabaseClient | undefined;
  response: NextResponse | undefined;

  /** The
   * @constructor
   * passes the supabase URL and Publishable Key into `SessionHandler`*/
  public constructor(
    private supabaseUrl: string,
    private supabasePublishableKey: string,
  ) {
    this.supabaseUrl = supabaseUrl;
    this.supabasePublishableKey = supabasePublishableKey;
  }

  /**
   * Reads the request cookies to load/refresh the user's session. Binds the
   * server client's cookie adapters to the `NextRequest`/`NextResponse` — the
   * only cookie wiring that works inside middleware (`next/headers` is not
   * available there).
   * @param request - The user's request.
   * @returns The response, updated with any JWT cookies refreshed by Supabase.
   */
  async updateSession(request: NextRequest): Promise<NextResponse | undefined> {
    // Seed the response before creating the client; `setAll` re-creates it so
    // refreshed cookies land on both the forwarded request and the response.
    let response = NextResponse.next({ request });

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
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    try {
      const { data } = await supabase.auth.getClaims();
      this.user = data?.claims;
      this.supabase = supabase;
      this.response = response;
    } catch (err) {
      if (err instanceof Error) {
        console.error(`[SessionHandler]: ${err.message}`);
        return undefined;
      } else {
        console.error(
          "[SessionHandler]: Unable to call auth.getClaims; an unknown error occurred.",
        );
        return undefined;
      }
    }
    return response;
  }
}
