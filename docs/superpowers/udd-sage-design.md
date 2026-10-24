# UDD-SAGE Website — Design Specification

Date: 2026-10-21
Status: Approved by the user on 2026-10-21; detailed implementation planning authorized.

## Purpose and agreed scope

Build the official website for **Universidad de Dagupan – Scholars’ Association for Greater Excellence**, abbreviated **UDD-SAGE**. Everyone can read published content without an account. Only authorized administrators can create, edit, publish, archive, and upload content. Examinations occur outside this website; the website publishes schedules and results.

The agreed stack is Next.js with React and TypeScript on Vercel, with Supabase PostgreSQL, Auth, and Storage. This is one application with public pages and a private admin dashboard. It does not require a separate Express backend.

Success means an administrator can publish a complete announcement, examination schedule, result file, or activity and a visitor can immediately find it on a responsive public page. People and committee leadership must remain consistent across academic terms.

## Branding and content

Use the supplied organization logo unchanged, with descriptive alternative text. Preserve its proportions. Use deep navy as the primary color, white and soft neutral backgrounds, and gold accents. Reserve the logo’s other colors for restrained accents. Favor a clean academic/editorial layout with readable type, generous spacing, clear dates, and prominent navigation.

The full organization name must appear on About and in the footer. Use UDD-SAGE in compact navigation. The homepage introduces the organization with the logo and full name, followed by current announcements, examinations, results, and activities.

Do not invent official mission, vision, objectives, officer names, examination dates, result files, contact details, or organizational history. Admin-editable sections show intentional empty states until real information is entered. A development-only demo dataset may be clearly labeled and must not silently appear as official production content.

## Public routes and behavior

| Route | Content and behavior |
|---|---|
| `/` | Logo, full name, editable introduction, featured news, important announcements, next examination, latest results, upcoming activities, quick links |
| `/about` | Background, description, mission, vision, objectives |
| `/news` | News and announcements, filter by type, search, pagination, archive filter |
| `/news/[slug]` | Title, cover image, publication date, article content, related attachments |
| `/officers` | Current academic term, eight core positions, committee heads and co-heads; previous-term selector |
| `/members` | Public directory with photo, name, year/batch, department, committee; search and filters; pagination |
| `/examinations` | Upcoming schedules and past schedules, with explicit status labels |
| `/examinations/[slug]` | Date, time, venue, instructions, reminders, related results |
| `/results` | Latest results and archives, filter by examination or year |
| `/results/[slug]` | Announcement, publication date, linked examination, downloadable result files |
| `/activities` | Upcoming and past activities, filters and pagination |
| `/activities/[slug]` | Event description, dates, venue, cover image, photo gallery, highlights |
| `/contact` | Official email, social links, location and contact information |

Contact uses links, not a message-submission form in the initial release. News and announcements share a publishing engine but retain separate type labels and admin filters. Search applies to each directory or listing; a global search service is outside the initial scope.

All dates and times display in Asia/Manila. Store timestamps with time zone; use date-only fields where only a calendar date is intended. Empty, loading, failed, and unavailable states must be intentional. Unpublished records return a public 404.

## Officers, committees, and terms

The eight core positions, in display order, are:

1. President
2. Vice President
3. Secretary
4. Sub-Secretary
5. VP for Projects and Development
6. VP for Finance
7. VP for Graphics and Media Information
8. VP for Internal and External Affairs

The four committees are:

| Committee | Head derived from core office | Additional leadership |
|---|---|---|
| Projects and Development | VP for Projects and Development | One co-head per academic term |
| Finance | VP for Finance | One co-head per academic term |
| Graphics and Media Information | VP for Graphics and Media Information | One co-head per academic term |
| Internal and External Affairs | VP for Internal and External Affairs | One co-head per academic term |

People have one profile; office assignments and committee memberships refer to that profile. Core office assignments are unique by term and position. Co-head assignments are unique by term and committee. Committee heads are derived from VP assignments and are not independently editable. A committee may have many members. A person cannot be head and co-head of the same committee in the same term.

Support academic terms with name, start date, end date, and one current-term designation. Switching the current term preserves historical assignments. Vacant positions display as vacant rather than assigning invented names. Removing a person with historical assignments is blocked; archive their profile instead.

## Administration

Routes include `/admin/login`, `/admin`, and module pages for site content, news, announcements, officers, members, examinations, results, activities, and media.

All administrators have the same content-editing permissions in the first release. Accounts are provisioned through Supabase administration; public registration is disabled. The site includes sign-in, sign-out, and password recovery. A separate administrator allowlist determines authorization, so an authenticated account alone is insufficient.

The dashboard shows draft and published counts and recent updates. Editors receive field-level validation, save feedback, loading indicators, and unsaved-change protection. Destructive operations require an explicit confirmation. Forms preserve entered content after failed saves.

Publishable records have draft, published, and archived states. Drafts are admin-only. Archived records remain publicly readable in archive views, but are excluded from current/featured sections. Returning a record to draft removes public access. Published edits take effect on save; revision history and scheduled publishing are outside the first release.

Administrators can preview drafts through authenticated routes. No public preview tokens are needed. Slugs are unique within their content type and remain stable after first publication. Store author and last-editor identifiers and timestamps.

## Data model

Use SQL migrations tracked with the source repository. Use relational tables rather than one unstructured table for the whole application.

| Table | Responsibility |
|---|---|
| `admin_users` | Authorized Supabase user IDs; no client-side role grants |
| `site_settings` | Singleton organization branding, introduction, About content, contact fields, social links and quick links |
| `academic_terms` | Term names, boundaries, current designation |
| `people` | Display name, biography, photo, department, year/batch, visibility status |
| `positions` | Eight fixed core positions and display order |
| `officer_assignments` | Person, position and term relationships |
| `committees` | Four fixed committees and their associated VP position |
| `committee_memberships` | Person, committee, term, member/co-head role |
| `posts` | News/announcement type, slug, title, excerpt, body, status, importance, featured flag, cover image, publication metadata |
| `examinations` | Slug, title, date/time, venue, instructions, reminders, cancellation/status details, publication state |
| `results` | Slug, title, announcement body, linked examination, publication state and date |
| `activities` | Slug, title, description, start/end time, venue, highlights, cover image, publication state |
| `media_assets` | Storage object path, filename, content type, size, alternative text, uploader |
| Content-specific attachment tables | Media references for posts, results and activities; gallery ordering and captions |

Apply foreign keys, unique constraints, timestamps, validation constraints and appropriate listing indexes. Lists use bounded pagination. Public results are announcements and downloadable files; individual score entry and calculation are outside the initial release.

## Architecture and access control

Use the Next.js App Router. Server Components load public data; Client Components handle interactive controls and forms. Validated server actions handle mutations, using the signed-in user's Supabase session. Share validation rules between forms and server actions. Use a restricted rich-text format with safe rendering and no arbitrary embedded HTML.

Use cookie-based Supabase SSR authentication. Verify the authenticated user and admin allowlist for each protected operation. Row Level Security independently enforces the same rules in PostgreSQL. Anonymous users can only select published or archived public records and public organization data. Non-admin authenticated users have no write permissions. Users cannot add themselves to `admin_users`.

Use public Supabase configuration in the browser only where appropriate. Never expose secret or service-role keys in client code. Normal content actions use session-bound clients, not a service-role bypass. Admin and authentication responses are private and uncached. Public changes invalidate affected pages after successful mutations.

## Images and documents

Use Supabase Storage with private buckets and media read policies based on the visibility of their owning content. A public download endpoint verifies that the parent is published or archived before issuing a short-lived signed URL. Admin previews also require authorization. This keeps draft attachments private without moving files between public and private buckets.

Allowed uploads: JPEG, PNG and WebP images up to 5 MB; PDF documents up to 20 MB. Validate type and size on the server and storage configuration; do not rely only on filename extensions. Use random storage names and retain original filenames as metadata. Require alternative text for editorial images and provide meaningful download labels.

Archiving preserves attachment access. Returning a record to draft prevents new public download authorizations; already-issued signed URLs may remain valid until their short expiry. Files referenced by content cannot be deleted until detached. Failed multi-step uploads should be recoverable and must not produce broken published links.

## Build organization and delivery sequence

Use one repository with feature folders for content, people, examinations, results, activities and administration. Shared components cover navigation, cards, page headings, form fields, pagination, empty states, dialogs and media selection. Database migrations and seed data live under `supabase/`.

Implement in these independently verifiable milestones:

1. Foundation: Next.js setup, logo, responsive shell, public routes, editable site content structure.
2. Security and publishing: schema, RLS, admin sign-in, post editor, draft preview, upload and public news flow.
3. Organization directory: people, terms, core offices, committee membership and co-head rules.
4. Examinations and results: schedules, details, announcements, result file downloads and archives.
5. Activities and homepage: event publishing, galleries, upcoming/past classification and homepage aggregation.
6. Release: accessibility, end-to-end checks, deployment instructions, Vercel configuration and Supabase setup.

Each milestone gets a detailed task plan with files, interfaces and acceptance checks. Vibe-coding sessions should implement one milestone or feature flow at a time, run its checks, and commit working progress. The approved spec remains the source of truth across sessions.

## Verification and completion criteria

- Production build and TypeScript checks pass.
- Public pages and navigation work on narrow mobile and desktop layouts, with keyboard-accessible controls and visible focus states.
- An administrator can create a draft, preview it, upload a file, publish it, edit it, archive it and return it to draft.
- Anonymous and non-admin authenticated requests cannot mutate content or read drafts, including through direct database/storage requests.
- Public archives retain readable entries and downloads; draft files cannot receive public download authorizations.
- Committee heads always match their VP assignments; duplicate offices and co-heads are rejected; prior terms remain available.
- Search, filters and pagination handle empty results and preserve selections in the URL.
- Examination and event dates render correctly in Manila time, including boundaries between upcoming and past.
- Invalid uploads, expired sessions, network failures and duplicate slugs produce actionable errors without discarding form data.
- Public routes have page titles, descriptions, share metadata, sitemap and robots configuration. Admin routes are excluded from indexing.
- Live deployment is considered complete only after the actual Supabase policies and the deployed Vercel application have been checked.

## Deployment inputs

Implementation can be developed locally. Live deployment requires the user's Vercel project and Supabase project access or configuration, a chosen domain if desired, an initial admin account, and real organizational content. Credentials must use environment configuration, never committed source files. Missing live access must be reported explicitly rather than presenting demo data as a connected production system.

Provide `.env.example`, migration instructions, admin bootstrap instructions, a Vercel deployment guide, and a concise editor guide. Pin compatible dependency versions at implementation time after checking current official guidance.

## Technical references

- Next.js App Router: https://nextjs.org/docs/app
- Next.js on Vercel: https://vercel.com/docs/frameworks/full-stack/nextjs
- Supabase Next.js quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase server-side authentication: https://supabase.com/docs/guides/auth/server-side

## Review notes

This specification incorporates the approved public/admin split, chosen stack, supplied organization name and logo, eight core positions, four VP-led committees, one co-head per committee, and externally conducted examinations. The default decisions above keep the first release implementable without inventing organizational facts. No application code or live resources have been created yet.
