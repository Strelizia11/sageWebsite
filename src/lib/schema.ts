import { z } from "zod";
import { manilaInputToISO } from "./domain";
const text = z.string().trim().max(20000).default("");
const name = z.string().trim().min(1, "This field is required.").max(200);
const id = z
  .union([z.string().uuid(), z.literal(""), z.null()])
  .optional()
  .transform((v) => v || null);
const status = z.enum(["draft", "published", "archived"]).default("draft");
const url = z
  .union([
    z.literal(""),
    z
      .url()
      .refine(
        (v) => /^https?:\/\//.test(v),
        "Use an https:// or http:// link.",
      ),
  ])
  .default("");
const date = z
  .string()
  .optional()
  .refine(
    (v) =>
      !v ||
      Number.isFinite(
        new Date(/Z$|[+-]\d\d:\d\d$/.test(v) ? v : v + "+08:00").getTime(),
      ),
    "Enter a valid date and time.",
  )
  .transform((v) => (v ? manilaInputToISO(v) : null));
const base = {
  title: name,
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase words separated by hyphens.",
    )
    .max(180),
  body: text,
  excerpt: text,
  status,
  cover_id: id,
};
export const schemas = {
  posts: z.object({
    ...base,
    type: z.enum(["news", "announcement"]).default("news"),
    featured: z.coerce.boolean().default(false),
    important: z.coerce.boolean().default(false),
  }),
  examinations: z
    .object({
      ...base,
      starts_at: date,
      venue: text,
      instructions: text,
      reminders: text,
      cancelled: z.coerce.boolean().default(false),
    })
    .refine((v) => v.status === "draft" || !!v.starts_at, {
      message: "Set the examination date before publishing.",
      path: ["starts_at"],
    }),
  results: z.object({
    ...base,
    examination_id: z.string().uuid("Select an examination."),
  }),
  activities: z
    .object({
      ...base,
      starts_at: date,
      ends_at: date,
      venue: text,
      highlights: text,
    })
    .refine((v) => !v.ends_at || (!!v.starts_at && v.ends_at >= v.starts_at), {
      message: "End must follow start.",
      path: ["ends_at"],
    })
    .refine((v) => v.status === "draft" || !!v.starts_at, {
      message: "Set a start date before publishing.",
      path: ["starts_at"],
    }),
  people: z.object({
    name,
    bio: text,
    department: text,
    batch: text,
    photo_id: id,
    status,
  }),
  academic_terms: z
    .object({
      name,
      starts_on: z.iso.date(),
      ends_on: z.iso.date(),
      is_current: z.coerce.boolean().default(false),
    })
    .refine((v) => v.ends_on >= v.starts_on, {
      message: "End must follow start.",
      path: ["ends_on"],
    }),
  officer_assignments: z.object({
    person_id: z.string().uuid(),
    position_id: z.coerce.number().int().min(1).max(8),
    term_id: z.string().uuid(),
  }),
  committee_memberships: z.object({
    person_id: z.string().uuid(),
    committee_id: z.coerce.number().int().min(1).max(4),
    term_id: z.string().uuid(),
    role: z.enum(["member", "co_head"]),
  }),
  site_settings: z.object({
    name: name.default(
      "Universidad de Dagupan – Scholars’ Association for Greater Excellence",
    ),
    introduction: text,
    background: text,
    description: text,
    mission: text,
    vision: text,
    objectives: text,
    email: z.union([z.literal(""), z.email()]).default(""),
    location: text,
    phone: text,
    social_url: url,
    social_links: text,
    quick_links: text,
    logo_id: id,
  }),
};
export type Table = keyof typeof schemas;
export function validateRecord(
  table: Table,
  input: unknown,
): Record<string, unknown> {
  return schemas[table].parse(input);
}
export type Field = {
  key: string;
  label: string;
  type?:
    | "textarea"
    | "select"
    | "checkbox"
    | "datetime-local"
    | "date"
    | "email"
    | "media";
  options?: string[];
  relation?: string;
  required?: boolean;
};
const content: Field[] = [
  { key: "title", label: "Title", required: true },
  { key: "slug", label: "URL slug", required: true },
  { key: "excerpt", label: "Short introduction", type: "textarea" },
  { key: "body", label: "Content (Markdown supported)", type: "textarea" },
  { key: "cover_id", label: "Cover image", type: "media" },
  {
    key: "status",
    label: "Visibility",
    type: "select",
    options: ["draft", "published", "archived"],
  },
];
export const modules: Record<Table, { label: string; fields: Field[] }> = {
  posts: {
    label: "News & announcements",
    fields: [
      ...content,
      {
        key: "type",
        label: "Type",
        type: "select",
        options: ["news", "announcement"],
      },
      { key: "featured", label: "Feature on homepage", type: "checkbox" },
      { key: "important", label: "Important announcement", type: "checkbox" },
    ],
  },
  examinations: {
    label: "Examinations",
    fields: [
      ...content,
      {
        key: "starts_at",
        label: "Examination date and time (Manila)",
        type: "datetime-local",
      },
      { key: "venue", label: "Venue" },
      { key: "instructions", label: "Instructions", type: "textarea" },
      { key: "reminders", label: "Reminders", type: "textarea" },
      { key: "cancelled", label: "Cancelled", type: "checkbox" },
    ],
  },
  results: {
    label: "Results",
    fields: [
      ...content,
      {
        key: "examination_id",
        label: "Examination",
        type: "select",
        relation: "examinations",
        required: true,
      },
    ],
  },
  activities: {
    label: "Activities & events",
    fields: [
      ...content,
      { key: "starts_at", label: "Starts (Manila)", type: "datetime-local" },
      { key: "ends_at", label: "Ends (Manila)", type: "datetime-local" },
      { key: "venue", label: "Venue" },
      { key: "highlights", label: "Highlights", type: "textarea" },
    ],
  },
  people: {
    label: "Members",
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "bio", label: "Short profile", type: "textarea" },
      { key: "department", label: "Department" },
      { key: "batch", label: "Year / batch" },
      { key: "photo_id", label: "Profile photo", type: "media" },
      {
        key: "status",
        label: "Visibility",
        type: "select",
        options: ["draft", "published", "archived"],
      },
    ],
  },
  academic_terms: {
    label: "Academic terms",
    fields: [
      { key: "name", label: "Academic year / term", required: true },
      { key: "starts_on", label: "Start date", type: "date", required: true },
      { key: "ends_on", label: "End date", type: "date", required: true },
      { key: "is_current", label: "Current term", type: "checkbox" },
    ],
  },
  officer_assignments: {
    label: "Core officers",
    fields: [
      {
        key: "term_id",
        label: "Term",
        type: "select",
        relation: "academic_terms",
        required: true,
      },
      {
        key: "position_id",
        label: "Position",
        type: "select",
        relation: "positions",
        required: true,
      },
      {
        key: "person_id",
        label: "Officer",
        type: "select",
        relation: "people",
        required: true,
      },
    ],
  },
  committee_memberships: {
    label: "Committees",
    fields: [
      {
        key: "term_id",
        label: "Term",
        type: "select",
        relation: "academic_terms",
        required: true,
      },
      {
        key: "committee_id",
        label: "Committee",
        type: "select",
        relation: "committees",
        required: true,
      },
      {
        key: "person_id",
        label: "Member",
        type: "select",
        relation: "people",
        required: true,
      },
      {
        key: "role",
        label: "Role (head is derived from VP)",
        type: "select",
        options: ["member", "co_head"],
      },
    ],
  },
  site_settings: {
    label: "Organization & contact",
    fields: [
      { key: "name", label: "Full organization name", required: true },
      { key: "logo_id", label: "Organization logo", type: "media" },
      ...[
        "introduction",
        "background",
        "description",
        "mission",
        "vision",
        "objectives",
      ].map((key) => ({
        key,
        label: key[0].toUpperCase() + key.slice(1),
        type: "textarea" as const,
      })),
      { key: "email", label: "Official email", type: "email" },
      { key: "phone", label: "Contact number" },
      { key: "location", label: "Location" },
      { key: "social_url", label: "Primary social page URL" },
      {
        key: "social_links",
        label: "Additional social links (one Label | https://url per line)",
        type: "textarea",
      },
      {
        key: "quick_links",
        label: "Homepage quick links (one Label | https://url per line)",
        type: "textarea",
      },
    ],
  },
};
