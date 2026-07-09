export const PROTECTED_ROUTES: string[] = [
  // main map page
  "/dashboard",
  // unique signup flow pages
  "/onboarding",
  // user profile routes
  "/profile",
  // user setting route
  "/settings",
];
export const AUTH_ROUTES: string[] = [
  "/auth/login",
  "/auth/sign-up",
  "/auth/confirmed-email",
  "/auth/verify-email",
];

/**
 * Informational screens in the email-confirmation flow. Unlike the login/
 * sign-up forms, these must render even for an authenticated-but-not-yet-
 * onboarded user: the confirmation link opens `confirmed-email` in a second
 * tab, and if the middleware bounced that tab to `/onboarding` we'd recreate
 * the exact double-tab onboarding race `confirmed-email` exists to prevent.
 */
export const CONFIRMATION_ROUTES: string[] = [
  "/auth/verify-email",
  "/auth/confirmed-email",
];
