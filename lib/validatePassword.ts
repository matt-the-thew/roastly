/**
 * Client-side password policy check that mirrors Supabase's default
 * "lowercase, uppercase, digits and symbols" requirement. This exists purely
 * to give the user *immediate, specific* feedback before a network round-trip —
 * Supabase remains the source of truth, and any server-side `weak_password`
 * rejection is still surfaced verbatim by the sign-up flow. Keep this lenient
 * enough that it never blocks a password Supabase would accept; drift between
 * the two only ever costs an extra (accurate) server error, never a false block.
 */

/** Minimum length. Mirrors the Supabase Auth password policy. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Symbol set that counts toward the "symbol" requirement. Restricted to the
 * common ASCII symbols Supabase recognises rather than "any non-alphanumeric",
 * so a stray space or unicode char doesn't read as a satisfied requirement.
 */
const SYMBOL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export interface PasswordCheck {
  valid: boolean;
  /**
   * Human-readable, noun-phrase descriptions of each *unmet* requirement,
   * e.g. `["an uppercase letter", "a symbol"]`. Empty when `valid` is true.
   */
  missing: string[];
}

/**
 * Validates `password` against the character-class + length policy.
 * @param password - The plaintext password to check.
 * @returns {PasswordCheck} - `valid` plus the list of unmet requirements.
 */
export function validatePassword(password: string): PasswordCheck {
  const missing: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    missing.push(`at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!/[a-z]/.test(password)) missing.push("a lowercase letter");
  if (!/[A-Z]/.test(password)) missing.push("an uppercase letter");
  if (!/[0-9]/.test(password)) missing.push("a number");
  if (!SYMBOL.test(password)) missing.push("a symbol");

  return { valid: missing.length === 0, missing };
}

/**
 * Formats a list of unmet requirements into a single, readable sentence
 * fragment: `["a number"]` -> "a number"; `["a number", "a symbol"]` ->
 * "a number and a symbol"; three+ -> Oxford-comma list.
 * @param items - The `missing` list from {@link validatePassword}.
 * @returns {string}
 */
export function formatMissingRequirements(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
