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
      const { data, error } = await supabase.auth.getClaims();

      // A present `error` (rather than a thrown exception) means the request
      // carried a session that could NOT be validated — a signature that
      // doesn't match the project's current JWKS (rotated signing key, or a
      // token minted by a *different* Supabase project), or a refresh token
      // that's expired/revoked and can't be exchanged. `getClaims` reports
      // these by returning `{ data: null, error }`, NOT by throwing, so the
      // catch block below never sees them.
      //
      // Left alone, the browser keeps re-sending the same poisoned cookie on
      // every request, `getClaims` fails again, and the user is wedged into a
      // permanent "logged out but can't recover" state (the stale-cookie
      // lockup). A genuinely anonymous request — no auth cookie at all —
      // returns no error and is untouched. So on a validation error we delete
      // the Supabase auth cookies, returning the client to a clean anonymous
      // state from which it can sign in again.
      if (error) {
        console.warn(
          `[SessionHandler]: clearing invalid session cookies — ${error.message}`,
        );
        this.clearAuthCookies(request, response);
        this.user = undefined;
      } else {
        this.user = data?.claims;
      }

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

  /**
   * Deletes every Supabase auth cookie from the response so the browser stops
   * re-sending an unusable session. `@supabase/ssr` names its cookies
   * `sb-<project-ref>-auth-token` and splits large ones into numbered chunks
   * (`…auth-token.0`, `…auth-token.1`, …); it also writes a
   * `…auth-token-code-verifier` during the PKCE flow. All share the `sb-`
   * prefix, so clearing every `sb-` cookie present on the request reliably
   * removes the whole (possibly chunked) session — a browser-side delete can
   * miss chunks written with server-side cookie options.
   *
   * The deletions are copied onto any redirect by `RedirectService.buildRedirect`,
   * so they survive a login/onboarding bounce in the same request.
   * @param request - The incoming request whose cookies we're clearing.
   * @param response - The response the `Set-Cookie` deletions are written to.
   */
  private clearAuthCookies(request: NextRequest, response: NextResponse): void {
    for (const { name } of request.cookies.getAll()) {
      if (name.startsWith("sb-")) {
        response.cookies.delete(name);
      }
    }
  }
}
