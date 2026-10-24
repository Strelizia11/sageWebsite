import { it, expect } from "vitest";
import { validateRecord } from "../../src/lib/schema";
it("rejects blank titles and unsafe slugs", () =>
  expect(() =>
    validateRecord("posts", {
      title: "",
      slug: "<script>",
      status: "published",
    }),
  ).toThrow());
it("rejects end before start", () =>
  expect(() =>
    validateRecord("activities", {
      title: "Event",
      slug: "event",
      starts_at: "2026-10-22T08:00",
      ends_at: "2026-10-21T08:00",
      status: "draft",
    }),
  ).toThrow());
it("rejects unsafe social links", () =>
  expect(() =>
    validateRecord("site_settings", {
      name: "SAGE",
      social_url: "javascript:alert(1)",
    }),
  ).toThrow());
it("strips fields that could promote an account", () => {
  const r = validateRecord("people", {
    name: "Scholar",
    status: "draft",
    is_admin: true,
  });
  expect(r).not.toHaveProperty("is_admin");
});
