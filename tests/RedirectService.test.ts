import { describe, it, expect } from "vitest";
import { RedirectService } from "@/app/actions/RedirectService";
import { NextURL } from "next/dist/server/web/next-url";

describe("RedirectService", () => {
  it("identifies requests to auth routes", () => {
    // dummyAuthRoutes matches the route signatures in AUTH_ROUTES in /lib/protectedRoutes.ts
    const dummyAuthRoutes = [
      ["https://test.com/auth/login", "/auth/login"],
      ["https://test.com/auth/sign-up", "/auth/sign-up"],
      ["https://test.com/auth/confirmed-email", "/auth/confirmed-email"],
      ["https://test.com/auth/verify-email", "/auth/verify-email"],
    ];
    for (let i = 0; i < dummyAuthRoutes.length; i++) {
      const dummyRedirectService = new RedirectService(
        dummyAuthRoutes[i][1],
        new NextURL(dummyAuthRoutes[i][0]),
      );

      const result = dummyRedirectService.isAuthRoute();
      expect(result).toBeTruthy();
    }
  });

  it("identifies requests to email-confirmation routes", () => {
    // dummyConfirmationRoutes matches CONFIRMATION_ROUTES in /lib/protectedRoutes.ts.
    // These are a subset of the auth routes but are exempt from the middleware's
    // auth-route redirect, so they must be reported by isConfirmationRoute().
    const dummyConfirmationRoutes = [
      ["https://test.com/auth/verify-email", "/auth/verify-email"],
      ["https://test.com/auth/confirmed-email", "/auth/confirmed-email"],
    ];
    for (let i = 0; i < dummyConfirmationRoutes.length; i++) {
      const dummyRedirectService = new RedirectService(
        dummyConfirmationRoutes[i][1],
        new NextURL(dummyConfirmationRoutes[i][0]),
      );

      expect(dummyRedirectService.isConfirmationRoute()).toBeTruthy();
    }
  });

  it("does not treat the login or sign-up forms as confirmation routes", () => {
    const nonConfirmationAuthRoutes = [
      ["https://test.com/auth/login", "/auth/login"],
      ["https://test.com/auth/sign-up", "/auth/sign-up"],
    ];
    for (let i = 0; i < nonConfirmationAuthRoutes.length; i++) {
      const dummyRedirectService = new RedirectService(
        nonConfirmationAuthRoutes[i][1],
        new NextURL(nonConfirmationAuthRoutes[i][0]),
      );

      expect(dummyRedirectService.isConfirmationRoute()).toBeFalsy();
    }
  });

  it("identifies the onboarding page as the onboarding route", () => {
    // Regression: /onboarding must report as the onboarding route so the
    // middleware's "not onboarded -> redirect to onboarding" rule has a base
    // case and doesn't redirect /onboarding onto itself (ERR_TOO_MANY_REDIRECTS).
    // The route is /onboarding, NOT /auth/onboarding.
    const onboarding = new RedirectService(
      "/onboarding",
      new NextURL("https://test.com/onboarding"),
    );
    expect(onboarding.isOnboardingRoute()).toBeTruthy();

    const notOnboarding = new RedirectService(
      "/dashboard",
      new NextURL("https://test.com/dashboard"),
    );
    expect(notOnboarding.isOnboardingRoute()).toBeFalsy();
  });

  it("identifies requests to protected routes", () => {
    // dummyProtectedRoutes matches the route signatures in PROTECTED_ROUTES in /lib/protectedRoutes.ts
    const dummyProtectedRoutes = [
      ["https://test.com/dashboard", "/dashboard"],
      ["https://test.com/onboarding", "/onboarding"],
      ["https://test.com/profile", "/profile"],
      ["https://test.com/settings", "/settings"],
    ];
    for (let i = 0; i < dummyProtectedRoutes.length; i++) {
      const dummyRedirectService = new RedirectService(
        dummyProtectedRoutes[i][1],
        new NextURL(dummyProtectedRoutes[i][0]),
      );

      const result = dummyRedirectService.isProtectedRoute();
      expect(result).toBeTruthy();
    }
  });

  it("ignores unprotected routes", () => {
    // mockRoutes are meant to be ignored, and match nothing
    const mockRoutes = [
      ["https://test.com/blog", "/blog"],
      ["https://test.com/index", "/index"],
      ["https://test.com/email-me", "/email-me"],
      ["https://test.com/cats", "/cats"],
      ["https://test.com/dogs", "/dogs"],
      ["https://test.com/uh-oh", "/uh-oh"],
      ["https://test.com/foo", "/foo"],
      ["https://test.com/yeehaw", "/yeehaw"],
    ];
    for (let i = 0; i < mockRoutes.length; i++) {
      const dummyRedirectService = new RedirectService(
        mockRoutes[i][1],
        new NextURL(mockRoutes[i][0]),
      );

      const protectedRouteResult = dummyRedirectService.isProtectedRoute();
      const authRouteResult = dummyRedirectService.isAuthRoute();

      expect(protectedRouteResult).toBeFalsy();
      expect(authRouteResult).toBeFalsy();
    }
  });
});
