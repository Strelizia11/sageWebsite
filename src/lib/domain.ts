export const FULL_NAME =
  "Universidad de Dagupan – Scholars’ Association for Greater Excellence";
export function parsePage(v: unknown) {
  const n = Number(v);
  return Number.isSafeInteger(n) && n > 0 && n < 100000 ? n : 1;
}
export function formatManilaDate(iso?: string | null) {
  return iso
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(iso))
    : "Date to be announced";
}
export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
export function manilaInputToISO(v: string) {
  if (!v) return null;
  if (/Z$|[+-]\d\d:\d\d$/.test(v)) return new Date(v).toISOString();
  return new Date(v + "+08:00").toISOString();
}
export function toManilaInput(v: string) {
  return new Date(new Date(v).getTime() + 8 * 3600000)
    .toISOString()
    .slice(0, 16);
}
export function isCurrent(
  start: string,
  end: string | null,
  now = new Date().toISOString(),
) {
  return new Date(end || start).getTime() >= new Date(now).getTime();
}
export function safeReturnPath(v: string | null) {
  return v?.startsWith("/admin") && !v.includes("\\") && !v.includes("//")
    ? v
    : "/admin";
}
export function validateUpload(type: string, size: number) {
  const max =
    type === "application/pdf"
      ? 20 * 1024 * 1024
      : ["image/png", "image/jpeg", "image/webp"].includes(type)
        ? 5 * 1024 * 1024
        : 0;
  return !max
    ? "Use JPEG, PNG, WebP or PDF."
    : size <= 0 || size > max
      ? "File exceeds the allowed size or is empty."
      : null;
}
export function validateSignature(b: Uint8Array, type: string) {
  const s = new TextDecoder().decode(b.slice(0, 12));
  if (type === "application/pdf") return s.startsWith("%PDF-");
  if (type === "image/png")
    return b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71;
  if (type === "image/jpeg")
    return b[0] === 255 && b[1] === 216 && b[2] === 255;
  return type === "image/webp" && s.startsWith("RIFF") && s.slice(8) === "WEBP";
}
export type ContentStatus = "draft" | "published" | "archived";
export type ActionResult<T = string> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
export type Row = {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  status?: ContentStatus;
  body?: string;
  excerpt?: string;
  updated_at?: string;
  published_at?: string;
  created_at?: string;
  cover_id?: string;
  photo_id?: string;
  starts_at?: string;
  ends_at?: string;
  [key: string]: unknown;
};
export const publicModules = {
  news: {
    table: "posts",
    label: "News & announcements",
    eyebrow: "THE SAGE JOURNAL",
    description:
      "Stories, official announcements, and updates from our community.",
  },
  examinations: {
    table: "examinations",
    label: "Examinations",
    eyebrow: "PREPARE WITH CONFIDENCE",
    description:
      "Schedules, venues, and everything you need to know before examination day.",
  },
  results: {
    table: "results",
    label: "Examination results",
    eyebrow: "YOUR NEXT CHAPTER",
    description:
      "Official result announcements and downloadable files, in one place.",
  },
  activities: {
    table: "activities",
    label: "Activities & events",
    eyebrow: "LIFE AT SAGE",
    description: "Come together. Get involved. Make a difference.",
  },
} as const;
export const positions = [
  "President",
  "Vice President",
  "Secretary",
  "Sub-Secretary",
  "VP for Projects and Development",
  "VP for Finance",
  "VP for Graphics and Media Information",
  "VP for Internal and External Affairs",
];
export const committees = [
  "Projects and Development",
  "Finance",
  "Graphics and Media Information",
  "Internal and External Affairs",
];
