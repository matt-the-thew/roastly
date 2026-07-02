import { test, expect } from "@playwright/test";

// Middleware (proxy.ts) redirects unauthenticated users away from protected
// routes. This is credential-independent and the core guarantee of the proxy.
test("Unauthorized user redirected to login", async ({ page }) => {
  await page.goto("http://localhost:3000/dashboard/homepage");
  await expect(page).toHaveURL("http://localhost:3000/auth/login");
});

// A valid submission should navigate the user off the login page. Requires a
// seeded/dev user in the target environment (see LoginService.signInAsDev).
test("Valid login submission navigates away from the login page", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/auth/login");

  await page.fill("input[name='email']", "hello@world.com");
  await page.fill("input[name='password']", "developer");
  await page.click("button[type='submit']");

  // On success the app redirects off /auth/login (to /auth/confirm or the
  // dashboard). Assert we leave the login page rather than pinning an exact
  // destination, which depends on onboarding state.
  await expect(page).not.toHaveURL("http://localhost:3000/auth/login");
});
