import assert from "node:assert/strict";
const base = process.env.TEST_SITE_URL || "http://127.0.0.1:3000";
for (const path of [
  "/",
  "/about",
  "/news",
  "/officers",
  "/members",
  "/examinations",
  "/results",
  "/activities",
  "/contact",
  "/admin/login",
]) {
  const r = await fetch(base + path);
  assert.equal(r.status, 200, path);
  const html = await r.text();
  assert.match(html, /<h1[ >]|<h2[ >]/, path);
  assert.ok(!html.includes("Application error:"), path);
  console.log("PASS", path);
}
const privatePage = await fetch(base + "/admin", { redirect: "manual" });
assert.ok([307, 303].includes(privatePage.status));
assert.match(privatePage.headers.get("location"), /admin\/login/);
console.log("PASS admin redirect");
const media = await fetch(
  base + "/api/media/00000000-0000-0000-0000-000000000001",
);
assert.equal(media.status, 404);
console.log("PASS inaccessible media");
const missing = await fetch(base + "/news/no-such-article");
assert.equal(
  missing.status,
  404,
  "Unpublished/missing article must return 404",
);
console.log("PASS missing article");
const map = await fetch(base + "/sitemap.xml");
assert.equal(map.status, 200);
assert.ok(!(await map.text()).includes("/admin"));
console.log("PASS public sitemap");
