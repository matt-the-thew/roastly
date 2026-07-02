import { SignJWT, jwtVerify } from "jose";
import { createHmac } from "crypto";
import { supabaseSRClient } from "@/lib/supabase/serviceRoleClient";
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
  REDEMPTION_SECRET = new TextEncoder().encode(
    process.env.BETA_KEY_JWT_SECRET,
  );

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
    // create salted hash for secrecy in transit
    const hash = createHmac("sha256", process.env.BETA_KEY_HMAC_SECRET!)
      .update(rawBetaKey.toUpperCase())
      .digest("hex");

    const { data, error } = await supabaseSRClient
      .from("beta_keys")
      // tentatively set used_at
      .update({ used_at: new Date().toISOString() })
      .eq("key_hash", hash)
      // leave used_by null, since no account yet exists
      .is("used_by", null)
      .select("id")
      .single();

    if (!data)
      throw new Error("[BetaKeyManager]: Non-existent/Expired beta key");
    if (error) throw new Error(`[BetaKeyManager]: ${error}`);

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
