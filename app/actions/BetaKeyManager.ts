import { SignJWT } from "jose";
import { createHmac, createHash } from "crypto";
import { supabaseSRClient } from "@/lib/supabase/serviceRoleClient";

/**
 * Unique type for {@function BetaKeyManager._createJWT}.
 * Supabase serializes UUID into 36-char hexadecimal string,
 * since JS has no native 128-bit int type.
 */
type BetaKeyTableRow = {
  id: string;
};

export class BetaKeyManager {
  /**
   * @classdesc Handles beta Key creation, validation,
   * and resulting auth sessions.
   */

  // jose requires Uint8Array input for signature
  REDEMPTION_SECRET = new TextEncoder().encode(
    process.env.BETA_Key_JWT_SECRET,
  );
  /**
   * Hashes key input and compares it to stored data.
   * @param rawKey {string} - unhashed key input
   * @returns {Array<Object>} - Supabase query result
   * @throws {Error} - Issue verifying beta key
   */
  async verifyBetaKey(rawKey: string) {
    const hash = createHash("sha256")
      .update(rawKey.toUpperCase())
      .digest("hex");

    const { data, error } = await supabaseSRClient
      .from("beta_keys")
      .select("key_hash")
      .eq("key_hash", hash)
      .is("used_by", null)
      .single();

    if (!data) throw new Error("Invalid/Exhausted beta key");
    if (error) throw new Error(`Error verifying key: ${error}`);
    return data;
  }

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
      .setExpirationTime("15m")
      .setJti(crypto.randomUUID())
      .sign(this.REDEMPTION_SECRET);

    return token;
  }

  async redeemBetaKey(rawBetaKey: string) {
    // create salted hash for secrecy in transit
    const hash = createHmac("sha256", process.env.BETA_KEY_JWT_SECRET!)
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

    if (!data) throw new Error("Invalid or expired beta key");
    if (error) throw new Error(`Error: ${error}`);

    return await this._createJWT(data);
  }
}
