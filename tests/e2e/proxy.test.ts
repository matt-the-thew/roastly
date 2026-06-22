import { test, expect } from "playwright/test";

test("Unauthorized user redirected to login", async ({ page }) => {
  await page.goto("http://localhost:3000/dashboard/homepage");
  await expect(page).toHaveURL("http://localhost:3000/auth/login");
});

test("Valid login submission works", async ({ page }) => {
  await page.goto("http://localhost:3000/auth/login");

  await page.fill("input[name='email'", "hello@world.com");
  await page.fill("input[name='password'", "developer");
  await page.click("button[type='submit'");

  const authJwt = await page.evaluate(() => localStorage.getItem(), arg);
});
