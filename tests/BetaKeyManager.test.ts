// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SignJWT } from "jose";
import { BetaKeyManager } from "@/app/actions/BetaKeyManager";
import {
  mockSupabaseClient,
  createQueryBuilder,
} from "@/__mocks__/supabase/supabaseClient";

const JWT_SECRET = "test-jwt-secret-value-for-beta-keys";
const HMAC_SECRET = "test-hmac-secret-value-for-beta-keys";

describe("BetaKeyManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("BETA_KEY_JWT_SECRET", JWT_SECRET);
    vi.stubEnv("BETA_KEY_HMAC_SECRET", HMAC_SECRET);
    // the service-role client now guards on these before createClient()
    vi.stubEnv("NEXT_PUBLIC_ROASTLY_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("ROASTLY_SUPABASE_SECRET_KEY", "sb_secret_test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("pulls environment secrets successfully", () => {
    const keyManager = new BetaKeyManager();
    expect(keyManager.REDEMPTION_SECRET).toBeDefined();
  });

  describe("JWT round-trip", () => {
    it("validates a token it just created", async () => {
      const keyManager = new BetaKeyManager();
      const token = await keyManager._createJWT({ id: "some-uuid" });
      expect(typeof token).toBe("string");
      await expect(keyManager.validateJWT(token)).resolves.toBe(true);
    });

    it("rejects a tampered/garbage token", async () => {
      const keyManager = new BetaKeyManager();
      const token = await keyManager._createJWT({ id: "some-uuid" });
      // flip the last character to invalidate the signature
      const tampered = token.slice(0, -1) + (token.at(-1) === "a" ? "b" : "a");
      await expect(keyManager.validateJWT(tampered)).resolves.toEqual(false);
      await expect(keyManager.validateJWT("not.a.jwt")).resolves.toEqual(false);
    });

    it("rejects a validly-signed token that lacks purpose:beta_redeem", async () => {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const wrongPurposeToken = await new SignJWT({
        key_id: "some-uuid",
        purpose: "not_beta_redeem",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer("https://roastly.dev/api/auth/verify-beta")
        .setAudience("https://roastly.dev/auth/sign-up")
        .setExpirationTime("15m")
        .sign(secret);

      const keyManager = new BetaKeyManager();
      await expect(keyManager.validateJWT(wrongPurposeToken)).resolves.toBe(
        false,
      );
    });
  });

  describe("redeemBetaKey", () => {
    it("returns a valid JWT on the success path", async () => {
      (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
        createQueryBuilder({ data: { id: "row-uuid-123" }, error: null }),
      );

      const keyManager = new BetaKeyManager();
      const token = await keyManager.redeemBetaKey("MY-BETA-KEY");

      expect(typeof token).toBe("string");
      // the returned token must validate through the same manager
      await expect(keyManager.validateJWT(token)).resolves.toBe(true);
    });

    it("throws 'not found' when no row matches the key_hash", async () => {
      // both the UPDATE and the disambiguating SELECT return no row
      (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
        createQueryBuilder({ data: null, error: null }),
      );

      const keyManager = new BetaKeyManager();
      await expect(keyManager.redeemBetaKey("BAD-KEY")).rejects.toThrow(
        "Beta key not found",
      );
    });

    it("throws 'already redeemed' when the row exists but the UPDATE matched nothing", async () => {
      // UPDATE (first `from`) matches zero rows, then the SELECT (second
      // `from`) finds the row with used_by set -> already redeemed
      (mockSupabaseClient.from as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(createQueryBuilder({ data: null, error: null }))
        .mockReturnValueOnce(
          createQueryBuilder({
            data: { id: "row-uuid-123", used_by: "some-user-uuid" },
            error: null,
          }),
        );

      const keyManager = new BetaKeyManager();
      await expect(keyManager.redeemBetaKey("USED-KEY")).rejects.toThrow(
        "already been redeemed",
      );
    });

    it("throws when the update returns a row alongside an error", async () => {
      // data present (passes the !data guard) but error set -> hits the
      // second guard branch
      (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
        createQueryBuilder({
          data: { id: "row-uuid-123" },
          error: { message: "rls conflict" },
        }),
      );

      const keyManager = new BetaKeyManager();
      await expect(keyManager.redeemBetaKey("MY-BETA-KEY")).rejects.toThrow(
        "[BetaKeyManager]",
      );
    });

    it("surfaces the real error when data is null because the query itself failed (e.g. an invalid service-role key), not because the row is missing", async () => {
      (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
        createQueryBuilder({
          data: null,
          error: { message: "Invalid API key" },
        }),
      );

      const keyManager = new BetaKeyManager();
      await expect(keyManager.redeemBetaKey("MY-BETA-KEY")).rejects.toThrow(
        "[BetaKeyManager]: Invalid API key",
      );
      // ACTUAL (pre-fix): the `!data` guard ran before the `error` guard, so
      // this query failure was misreported as "Non-existent/Expired beta key"
      // instead of the real PostgREST error.
    });
  });
});
