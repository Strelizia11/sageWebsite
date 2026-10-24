import { describe, it, expect } from "vitest";
import {
  parsePage,
  formatManilaDate,
  manilaInputToISO,
  isCurrent,
  safeReturnPath,
  validateUpload,
  validateSignature,
} from "../../src/lib/domain";
describe("public filters and local dates", () => {
  it("normalizes malformed pages", () => {
    for (const value of ["-1", "abc", undefined, "1.5"])
      expect(parsePage(value)).toBe(1);
    expect(parsePage("3")).toBe(3);
  });
  it("renders the following Manila day", () =>
    expect(formatManilaDate("2026-10-21T16:30:00Z")).toContain("October 22"));
  it("converts Manila local input independently of server timezone", () =>
    expect(manilaInputToISO("2026-10-22T00:30")).toBe(
      "2026-10-21T16:30:00.000Z",
    ));
  it("classifies an ongoing event by end instant", () =>
    expect(
      isCurrent(
        "2026-10-21T15:00:00Z",
        "2026-10-21T17:00:00Z",
        "2026-10-21T16:00:00Z",
      ),
    ).toBe(true));
  it("rejects external callback paths", () => {
    expect(safeReturnPath("//evil.com")).toBe("/admin");
    expect(safeReturnPath("/admin/recovery")).toBe("/admin/recovery");
  });
});
describe("uploads", () => {
  it("accepts the exact image boundary and rejects oversized bytes", () => {
    expect(validateUpload("image/png", 5 * 1024 * 1024)).toBeNull();
    expect(validateUpload("image/png", 5 * 1024 * 1024 + 1)).toBeTruthy();
  });
  it("allows PDFs through 20 MB but not unsupported or empty data", () => {
    expect(validateUpload("application/pdf", 20 * 1024 * 1024)).toBeNull();
    expect(validateUpload("text/html", 100)).toBeTruthy();
    expect(validateUpload("image/png", 0)).toBeTruthy();
  });
  it("rejects disguised scripts and accepts PDF magic bytes", () => {
    expect(
      validateSignature(
        new TextEncoder().encode("<script>"),
        "application/pdf",
      ),
    ).toBe(false);
    expect(
      validateSignature(
        new TextEncoder().encode("%PDF-1.7"),
        "application/pdf",
      ),
    ).toBe(true);
  });
});
