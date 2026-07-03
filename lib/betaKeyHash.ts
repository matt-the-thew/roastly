import { createHmac } from "node:crypto";

/**
 * Canonical beta-key normalization + hashing.
 *
 * This is the single source of truth shared by BOTH:
 *   - the app  (app/actions/BetaKeyManager.ts, verify-beta route)
 *   - the seeder (tools/beta-token-generator/seed-beta-keys.ts)
 *
 * The stored `key_hash` and the hash computed at redemption time MUST be
 * produced by the exact same function, or redemption silently matches zero
 * rows and the user sees a spurious "beta key not found". Previously the two
 * sides diverged: the seeder hashed the raw `XXXX-XXXX` string (with hyphen)
 * while the app hashed `rawKey.toUpperCase()`, so they only agreed by accident
 * (uppercase input + hyphen typed by hand).
 *
 * `normalizeBetaKey` strips every non-alphanumeric character (hyphens,
 * whitespace) and uppercases, so `a7k2-9qxw`, `A7K2 9QXW`, and `A7K29QXW` all
 * hash identically. Deliberately dependency-free (only `node:crypto`) so the
 * standalone seeder package can import it without pulling in app internals.
 *
 * NOTE: changing this normalization changes every stored hash — a change here
 * requires re-seeding `beta_keys`.
 */
export function normalizeBetaKey(rawKey: string): string {
  return rawKey.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

/** HMAC-SHA256 of the normalized key. `secret` is BETA_KEY_HMAC_SECRET. */
export function hashBetaKey(rawKey: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(normalizeBetaKey(rawKey))
    .digest("hex");
}
