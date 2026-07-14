import { SignJWT, jwtVerify } from "jose";
import { getSupabaseSRClient } from "@/lib/supabase/serviceRoleClient";
import { hashBetaKey } from "@/lib/betaKeyHash";
/* Server-only, handles beta-key encryption secrets */
import "server-only";

/**
 * Unique type for {@function BetaKeyManager._createJWT}.
 * Supabase serializes UUID into 36-char hexadecimal string,
 * since JS has no native 128-bit int type.
 */
type BetaKeyTableRow = {
  id: string;
};

/**
 * @classdesc Handles beta Key creation, validation,
 * and resulting auth sessions.
 */
export class BetaKeyManager {
  // jose requires Uint8Array input for signature
  REDEMPTION_SECRET = new TextEncoder().encode(process.env.BETA_KEY_JWT_SECRET);

  /**
   * Creates and signs JWT to authorize sign up
   * when beta key successfully redeemed.
   * @param data {Object} - Supabase "beta_key" table
   * response object.
   */
  async _createJWT(data: BetaKeyTableRow): Promise<string> {
    const token = await new SignJWT({
      key_id: data.id,
      purpose: "beta_redeem",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("https://roastly.dev/api/auth/verify-beta")
      .setAudience("https://roastly.dev/auth/sign-up")
      .setExpirationTime("15m")
      .setJti(crypto.randomUUID())
      .sign(this.REDEMPTION_SECRET);

    return token;
  }

  /**
   * Creates HMAC with symmetrical secret key, and compares to
   * stored values in DB with service role access.
   * @param rawBetaKey {string} - unhashed key input
   * @returns {string} - signed JWT to initialize sign-up session
   * @throws Will throw Error when beta key is Non-Existent/Expired.
   */
  async redeemBetaKey(rawBetaKey: string): Promise<string> {
    // hash via the shared helper so this always agrees with the seeder
    const hash = hashBetaKey(rawBetaKey, process.env.BETA_KEY_HMAC_SECRET!);

    const supabase = getSupabaseSRClient();
    if (!supabase) {
      throw new Error("[BetaKeyManager]: unable to initialize supabase client");
    }

    const { data, error } = await supabase
      .from("beta_keys")
      // tentatively set used_at
      .update({ used_at: new Date().toISOString() })
      .eq("key_hash", hash)
      // leave used_by null, since no account yet exists
      .is("used_by", null)
      .select("id")
      .maybeSingle();

    // A genuine query failure (bad service-role key, RLS, etc.) must be
    // surfaced before the no-row branch, or it gets misreported as "not found".
    if (error) throw new Error(`[BetaKeyManager]: ${error.message}`);

    // `data` is null when the conditional UPDATE matched zero rows. That has
    // two very different causes — disambiguate so the error is actionable
    // instead of the old catch-all "Non-existent/Expired beta key".
    if (!data) {
      const { data: existing, error: lookupError } = await supabase
        .from("beta_keys")
        .select("id, used_by")
        .eq("key_hash", hash)
        .maybeSingle();

      if (lookupError)
        throw new Error(`[BetaKeyManager]: ${lookupError.message}`);
      if (!existing)
        throw new Error(
          "[BetaKeyManager]: Beta key not found — no matching key_hash in the database",
        );
      // row exists but the UPDATE was filtered out, i.e. used_by is set
      throw new Error("[BetaKeyManager]: Beta key has already been redeemed");
    }

    return (await this._createJWT(data)) as string;
  }

  /**
   * Accepts and verifies JWT token issued by {@function redeemBetaKey}.
   * @param jwt{string}
   * @returns {boolean} - Whether or not the jwt is valid.
   */
  async validateJWT(jwt: string): Promise<boolean> {
    try {
      console.log("verifying passed JWT:", jwt);
      const { payload } = await jwtVerify(jwt, this.REDEMPTION_SECRET, {
        issuer: "https://roastly.dev/api/auth/verify-beta",
        audience: "https://roastly.dev/auth/sign-up",
      });

      /*Simply return true if JWT is validated with purpose*/
      if (payload.purpose == "beta_redeem") {
        return true;
      }
      return false;
    } catch {
      /*Simply return false if error occues in jose method */
      return false;
    }
  }
}
