import { it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { homeQuery, relatedQuery } from "../../src/lib/public-queries";
function client() {
  const urls: URL[] = [];
  const db = createClient("https://test.supabase.co", "test-public-key", {
    global: {
      fetch: async (input) => {
        urls.push(new URL(String(input)));
        return new Response("[]", {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  });
  return { db, urls };
}
it("filters featured posts in the database before the three-item limit", async () => {
  const { db, urls } = client();
  await homeQuery(db, "featured");
  expect(urls[0].searchParams.get("featured")).toBe("eq.true");
  expect(urls[0].searchParams.get("status")).toBe("eq.published");
  expect(urls[0].searchParams.get("limit")).toBe("3");
  expect(urls[0].searchParams.get("order")).toContain("published_at.desc");
});
it("excludes cancelled examinations from the next-exam query", async () => {
  const { db, urls } = client();
  await homeQuery(db, "examination");
  expect(urls[0].searchParams.get("cancelled")).toBe("eq.false");
  expect(urls[0].searchParams.get("limit")).toBe("1");
});
it("orders and limits important announcements after filtering", async () => {
  const { db, urls } = client();
  await homeQuery(db, "announcements");
  expect(urls[0].searchParams.get("important")).toBe("eq.true");
  expect(urls[0].searchParams.get("type")).toBe("eq.announcement");
  expect(urls[0].searchParams.get("order")).toContain("published_at.desc");
});
it("only links public results for the specified examination", async () => {
  const { db, urls } = client();
  await relatedQuery(db, "examinations", { id: "exam-id" });
  expect(urls[0].searchParams.get("examination_id")).toBe("eq.exam-id");
  expect(urls[0].searchParams.get("status")).toBe("in.(published,archived)");
});
