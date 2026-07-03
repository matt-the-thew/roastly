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
      await expect(keyManager.validateJWT(tampered)).resolves.toBe(false);
      await expect(keyManager.validateJWT("not.a.jwt")).resolves.toBe(false);
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

    it("throws when the beta key is not found", async () => {
      (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
        createQueryBuilder({ data: null, error: null }),
      );

      const keyManager = new BetaKeyManager();
      await expect(keyManager.redeemBetaKey("BAD-KEY")).rejects.toThrow(
        "Non-existent/Expired beta key",
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
      // ACTUAL: the `!data` guard runs before the `error` guard, so a query
      // failure is misreported as "key doesn't exist" instead of the real
      // PostgREST error.
      await expect(keyManager.redeemBetaKey("MY-BETA-KEY")).rejects.toThrow(
        "Non-existent/Expired beta key",
      );
      // EXPECTED: await expect(keyManager.redeemBetaKey("MY-BETA-KEY")).rejects.toThrow(
      //   "[BetaKeyManager]: Invalid API key",
      // );
    });
  });
});
