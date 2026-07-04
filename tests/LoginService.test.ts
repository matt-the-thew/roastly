import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

vi.mock("react-hot-toast", () => ({
  default: { promise: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

import { LoginService } from "@/app/actions/LoginService";
import {
  mockSupabaseClient,
  createQueryBuilder,
} from "@/__mocks__/supabase/supabaseClient";

describe("LoginService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("signInWithEmail", () => {
    it("returns true when signInWithPassword succeeds", async () => {
      (
        mockSupabaseClient.auth.signInWithPassword as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({ error: null });

      const service = new LoginService();
      const result = await service.signInWithEmail("a@b.com", "pw");

      expect(result).toBe(true);
      expect(
        mockSupabaseClient.auth.signInWithPassword,
      ).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "pw",
      });
    });

    it("returns false when signInWithPassword errors", async () => {
      (
        mockSupabaseClient.auth.signInWithPassword as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({ error: { message: "bad creds" } });

      const service = new LoginService();
      const result = await service.signInWithEmail("a@b.com", "wrong");

      expect(result).toBe(false);
    });
  });

  describe("signInAsDev", () => {
    it("calls signInAnonymously when in dev and no session exists", async () => {
      vi.stubEnv("DEV_LOGIN", "true");
      (
        mockSupabaseClient.auth.getSession as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ data: { session: null } });
      (
        mockSupabaseClient.auth.signInAnonymously as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({ data: {}, error: null });

      const service = new LoginService();
      await service.signInAsDev();

      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.signInAnonymously).toHaveBeenCalled();
    });

    it("does NOT call signInAnonymously when a session already exists", async () => {
      vi.stubEnv("DEV_LOGIN", "true");
      (
        mockSupabaseClient.auth.getSession as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ data: { session: { user: { id: "x" } } } });

      const service = new LoginService();
      await service.signInAsDev();

      expect(
        mockSupabaseClient.auth.signInAnonymously,
      ).not.toHaveBeenCalled();
    });

    describe("checkNewUser", () => {
      it("returns false when there is no authenticated user", async () => {
        (
          mockSupabaseClient.auth.getUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue({ data: { user: null } });

        const service = new LoginService();
        await expect(service.checkNewUser()).resolves.toBe(false);
      });

      it("returns true when the user has a profile row", async () => {
        (
          mockSupabaseClient.auth.getUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue({ data: { user: { id: "user-1" } } });
        (
          mockSupabaseClient.from as ReturnType<typeof vi.fn>
        ).mockReturnValue(
          createQueryBuilder({ data: { id: "user-1" }, error: null }),
        );

        const service = new LoginService();
        await expect(service.checkNewUser()).resolves.toBe(true);
      });

      it("returns false when the user has no profile row (falsy profile)", async () => {
        (
          mockSupabaseClient.auth.getUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue({ data: { user: { id: "user-1" } } });
        (
          mockSupabaseClient.from as ReturnType<typeof vi.fn>
        ).mockReturnValue(createQueryBuilder({ data: null, error: null }));

        const service = new LoginService();
        await expect(service.checkNewUser()).resolves.toBe(false);
      });

      it("throws when the profile query returns an error", async () => {
        (
          mockSupabaseClient.auth.getUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue({ data: { user: { id: "user-1" } } });
        (
          mockSupabaseClient.from as ReturnType<typeof vi.fn>
        ).mockReturnValue(
          createQueryBuilder({
            data: null,
            error: { message: "db down" },
          }),
        );

        const service = new LoginService();
        await expect(service.checkNewUser()).rejects.toThrow(
          "LOGIN_SERVICE",
        );
      });
    });

    describe("signInWithGoogle", () => {
      it("wraps the OAuth call in toast.promise with the right redirect and messages", async () => {
        const toast = (await import("react-hot-toast")).default;
        const oauthPromise = Promise.resolve({
          data: { provider: "google", url: "https://oauth" },
          error: null,
        });
        (
          mockSupabaseClient.auth.signInWithOAuth as ReturnType<
            typeof vi.fn
          >
        ).mockReturnValue(oauthPromise);
        (toast.promise as ReturnType<typeof vi.fn>).mockImplementation(
          (p: Promise<unknown>) => p,
        );

        const service = new LoginService();
        await service.signInWithGoogle();

        expect(
          mockSupabaseClient.auth.signInWithOAuth,
        ).toHaveBeenCalledWith(
          expect.objectContaining({ provider: "google" }),
        );
        expect(toast.promise).toHaveBeenCalledWith(
          oauthPromise,
          expect.objectContaining({
            loading: "Signing in with Google…",
            success: "Redirecting…",
            error: "Sign-in failed",
          }),
        );
      });
    });

    describe("signUpWithEmailAndPassword", () => {
      it("throws when signUp returns an error", async () => {
        (
          mockSupabaseClient.auth.signUp as ReturnType<typeof vi.fn>
        ).mockResolvedValue({ error: { message: "taken" } });

        const service = new LoginService();
        await expect(
          service.signUpWithEmailAndPassword("a@b.com", "pw"),
        ).rejects.toThrow("Error creating account");
      });

      it("resolves when signUp succeeds", async () => {
        // With email confirmation enabled, signUp returns the created user on
        // its own response (no session); the user is read straight off it.
        (
          mockSupabaseClient.auth.signUp as ReturnType<typeof vi.fn>
        ).mockResolvedValue({ data: { user: { id: "u" } }, error: null });

        const service = new LoginService();
        await expect(
          service.signUpWithEmailAndPassword("a@b.com", "pw"),
        ).resolves.toBeDefined();
        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalled();
      });

      it("throws when signUp succeeds but no user is present afterward", async () => {
        (
          mockSupabaseClient.auth.signUp as ReturnType<typeof vi.fn>
        ).mockResolvedValue({ data: { user: null }, error: null });

        const service = new LoginService();
        await expect(
          service.signUpWithEmailAndPassword("a@b.com", "pw"),
        ).rejects.toThrow("No user returned from sign up");
      });
    });
  });
});
