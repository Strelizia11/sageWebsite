import { it, expect } from "vitest";
import { fieldChoices } from "../../src/lib/editor-options";
it("does not put uploaded files in a static visibility select", () =>
  expect(
    fieldChoices(
      {
        key: "status",
        label: "Visibility",
        type: "select",
        options: ["draft"],
      },
      { media_assets: [{ id: "photo", name: "Photo" }] },
    ),
  ).toEqual([]));
it("refreshing media choices only changes the option set", () => {
  const field = { key: "cover_id", label: "Cover", type: "media" as const };
  expect(
    fieldChoices(field, {
      media_assets: [
        { id: "photo", mime: "image/png" },
        { id: "pdf", mime: "application/pdf" },
      ],
    }).map((x) => x.id),
  ).toEqual(["photo"]);
});
