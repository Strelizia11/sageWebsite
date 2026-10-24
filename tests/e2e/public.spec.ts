import { test, expect } from "@playwright/test";
test("public navigation and mobile menu are usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const route of [
    "/about",
    "/news",
    "/officers",
    "/members",
    "/examinations",
    "/results",
    "/activities",
    "/contact",
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
});
test("private dashboard and unknown articles are inaccessible", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/admin\/login/);
  const response = await page.goto("/news/no-such-article");
  expect(response?.status()).toBe(404);
});
