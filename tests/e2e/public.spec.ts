import { test, expect } from "@playwright/test";
test("seal ripples have no controls and respect reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".seal-orbit").getByRole("button")).toHaveCount(0);
  await expect(page.locator(".seal-ripple").first()).toHaveCSS(
    "animation-name",
    "seal-ripple-out",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".seal-ripple").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("academic homepage keeps identity and examination access usable at every size", async ({
  page,
}) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("img", { name: /official seal/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View examinations" }),
    ).toHaveAttribute("href", "/examinations");
    expect(
      await page.locator("body").evaluate((el) => el.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test("mobile navigation dismisses with Escape and returns keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "About", exact: true })
    .press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeHidden();
});

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
