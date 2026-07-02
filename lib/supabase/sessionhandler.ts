import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { JwtPayload } from "@supabase/supabase-js";

/** Handles creation and lifecycle of user sessions
 * @param supabaseUrl - The Supabase project url.
 * @param supabasePublishableKey - The Supabase project publishable key.
 * @property user - JWT claims for the user, if the user exists.
 * Properties listed on [Supabase's JWT Docs](https://supabase.com/docs/guides/auth/jwt-fields)
 */
export class SessionHandler {
  user: JwtPayload | undefined;
  request: NextRequest | undefined;

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
   * Accesses local cookies to set/refresh JWTs.
   * @param request - The user's request.
   * @returns The user's request, updated with JWTs modified by Supabase.
   */
  async updateSession(request: NextRequest): Promise<NextResponse | void> {
    try {
      /*Create a new server client, and pass cookies from it as Supabase
        recommends. The parameter-object mess below is THEIR recommended
        best practice, I did not write this code.*/
      const supabaseServerClient = createServerClient(
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

      /**
       * Amended request from supabaseServerClient.
       */
      const supabaseResponse: NextResponse = NextResponse.next(
        this.request,
      );

      const { data } = await supabaseServerClient.auth.getClaims();
      this.user = data?.claims;

      return supabaseResponse;
    } catch (error) {
      if (error) {
        console.error(
          `[SessionHandler]: an unknown error occurred ${error}`,
        );
      }
    }
  }
}
