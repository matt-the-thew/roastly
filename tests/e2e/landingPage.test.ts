import { test, expect } from "@playwright/test";

test("Has title", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await expect(page).toHaveTitle("Roastly: See What's Brewing");
});

test("Has login link", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  expect(page.getByRole("link", { name: "Log In" })).toBeVisible();
});

test("Login link is live", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await page.getByRole("link", { name: "Log In" }).click();
});
