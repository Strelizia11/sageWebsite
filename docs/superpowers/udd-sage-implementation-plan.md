# UDD-SAGE Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Execution begins after user review and selection of execution method.

**Goal:** Build the complete public UDD-SAGE website and its administrator publishing dashboard.

**Architecture:** One Next.js App Router application on Vercel, backed by Supabase PostgreSQL, Auth and private Storage. Server-rendered public pages read published/archived content; session-bound server actions and database policies enforce admin-only mutations. Relational people, terms and office assignments keep committee leadership consistent.

**Tech Stack:** Next.js, React, TypeScript, Supabase JS/SSR, Zod, CSS, Vitest, Playwright, PostgreSQL policy tests through Supabase CLI. Pin mutually compatible stable versions and commit the lockfile during Task 1.

**Spec:** [Approved design](udd-sage-design.md).

## Global constraints

- Organization: **Universidad de Dagupan – Scholars’ Association for Greater Excellence**; abbreviation: **UDD-SAGE**.
- Use the supplied organization logo unchanged, with descriptive alternative text. Preserve its proportions.
- Everyone can read published content without an account. Only authorized administrators can create, edit, publish, archive, and upload content.
- Examinations occur outside this website; the website publishes schedules and results.
- All dates and times display in Asia/Manila.
- Allowed uploads: JPEG, PNG and WebP images up to 5 MB; PDF documents up to 20 MB.
- Drafts are admin-only. Archived records remain publicly readable in archive views, but are excluded from current/featured sections.
- Committee heads are derived from VP assignments and are not independently editable.
- A person cannot be head and co-head of the same committee in the same term.
- Do not invent official mission, vision, objectives, officer names, examination dates, result files, contact details, or organizational history.
- Never expose secret or service-role keys in client code.
- Contact uses links, not a message-submission form in the initial release.
- Live deployment is considered complete only after the actual Supabase policies and the deployed Vercel application have been checked.

## Review focus

1. A signed-in user without an admin allowlist entry attempts a direct write or self-promotion: reject in SQL and server actions (Task 2).
2. A previously public attachment is moved to draft: deny new public links and preserve only already-issued URLs until their 60-second expiry (Task 4).
3. Updating a VP assignment makes the VP equal to an existing co-head: reject both assignment directions, including concurrent transactions (Task 6).
4. A Manila date boundary disagrees with UTC: classify upcoming/past using the actual instant and display local time consistently (Tasks 7–8).
5. An upload or session expires during an edit: keep form values, show actionable errors, and prevent incomplete files from being published (Tasks 3–5, 9).

## Workspace and file boundaries

Create the repository at `outputs/udd-sage/` relative to this chat workspace. All subsequent paths are relative to that repository. Copy the approved spec and this plan into `docs/superpowers/` before implementation, and preserve the original logo as `public/udd-sage-logo.png` from `C:/Users/Jhomar/AppData/Local/Temp/codex-clipboard-7a073a4f-6a98-45fb-a7c8-e4e25277d9c1.png`.

```text
src/app/(public)/             Public routes from the approved specification
src/app/admin/                Sign-in, recovery, dashboard and module editors
src/app/auth/callback/        Recovery and authentication callback
src/app/api/media/            Authorized upload preparation/finalization/download
src/components/               Shared accessible presentation and form components
src/features/site/            Organization settings, homepage and contact
src/features/posts/           News and announcements
src/features/people/          Members, offices, terms and committees
src/features/examinations/    Schedules and result announcements
src/features/activities/      Activities and galleries
src/features/media/           Validation, lifecycle and attachment ownership
src/lib/supabase/             Browser/server clients and generated database types
src/lib/auth/                 Verified admin authorization
src/lib/                      Dates, pagination, safe content and shared contracts
supabase/migrations/          Schema, constraints, RLS, buckets and database functions
supabase/tests/               Real database constraints and authorization tests
tests/unit/                   Domain and validation tests
tests/e2e/                    Public/admin browser flows
docs/                         Deployment, editing and vibe-coding guides
```

Each task below ends in a working deliverable, its verification, and a commit. Do not run unrelated refactors or replace real permission checks with mocked success. If Docker/Supabase CLI or external credentials are unavailable, complete independent work and report the exact integration checks still pending.

## Task 1: Responsive public shell and shared contracts

**Files:** `package.json`, lockfile, `tsconfig.json`, Next/Vitest/Playwright configuration, `.gitignore`, `.env.example`, `public/udd-sage-logo.png`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/(public)/layout.tsx`, `src/components/{header,footer,page-heading,empty-state,pagination}.tsx`, `src/lib/{contracts,dates,pagination}.ts`, `tests/unit/dates.test.ts`, `tests/e2e/shell.spec.ts`.

**Interfaces:** Define `ContentStatus = 'draft' | 'published' | 'archived'`, `PageResult<T> = {items:T[]; total:number; page:number; pageSize:number}`, `ActionResult<T> = {ok:true; data:T} | {ok:false; message:string; fieldErrors?:Record<string,string[]>}`, `ListQuery = {page:number; query?:string; archived:boolean}`. Export `formatManilaDate(iso:string):string` and `parsePage(value:unknown):number`. Lists use 12 records per page with deterministic secondary ID ordering.

- [ ] Initialize the repository, pin dependencies and scripts (`dev`, `build`, `typecheck`, `test`, `test:e2e`, `test:db`), copy the supplied logo without editing, and commit the approved documents.
- [ ] Write date tests asserting `formatManilaDate('2026-10-21T16:30:00Z')` contains `22` and `October`; `parsePage('-1')`, `parsePage('abc')` and `parsePage(undefined)` equal `1`. Write shell browser checks for full organization name, all public navigation destinations, keyboard menu operation, and no horizontal overflow at 390px.
- [ ] Run `npm test -- tests/unit/dates.test.ts` and `npm run test:e2e -- tests/e2e/shell.spec.ts`; confirm failures reflect missing behavior.
- [ ] Implement navy/white/gold tokens, responsive header/footer, route headings and honest empty states for every public route. Use local/system font fallback and preserve logo aspect ratio. Implement date and pagination contracts.
- [ ] Run those tests, `npm run typecheck` and `npm run build`; all must pass. Commit `feat: establish UDD-SAGE public shell`.

## Task 2: Database schema and enforceable permissions

**Files:** `supabase/config.toml`, `supabase/migrations/0001_schema.sql`, `0002_access.sql`, `supabase/seed.sql`, `supabase/tests/{authorization,constraints}.sql`, `src/lib/supabase/database.types.ts`, `src/lib/auth/require-admin.ts`.

**Interfaces:** Create the tables listed in the approved spec plus `post_attachments`, `result_attachments`, `activity_media`. All content IDs are UUIDs. `is_admin():boolean` uses `auth.uid()` and a restricted allowlist lookup. `requireAdmin():Promise<{id:string}>` verifies identity and authorization or throws a typed access error. Generate `Database` types from the actual schema. `media_assets.state` is `pending | ready`; only ready objects may be attached.

- [ ] Write real SQL role tests: anonymous users see published/archived rows but zero drafts; authenticated non-admin INSERT/UPDATE/DELETE fail; self-insertion into `admin_users` fails; an allowed admin can create/edit drafts. Test private fields and hidden-person relationships do not leak through views.
- [ ] Run `npm run test:db` against an isolated local Supabase stack and record the initial missing-schema failure.
- [ ] Implement schema, foreign keys, slug/status checks, author/editor tracking, listing indexes and RLS on every exposed table. Use security-invoker views or explicitly secured functions. Restrict function search paths and grants. Seed only fixed positions, committees and the supplied organization identity.
- [ ] Add singleton settings, unique position-per-term constraints, partial unique co-head and current-term constraints, reference-safe deletions, and admin-only assignment mutations. Draft/archived visibility must match the spec.
- [ ] Generate types, run SQL tests and typecheck, and commit `feat: enforce content access in Supabase`.

## Task 3: Admin sessions and reusable editing shell

**Files:** `src/lib/supabase/{client,server}.ts`, the installed Next.js version's session refresh entry point, `src/app/admin/{layout,page}.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/recovery/page.tsx`, `src/app/auth/callback/route.ts`, `src/components/admin/{shell,form-status,confirm-dialog,dirty-form}.tsx`, `tests/e2e/auth.spec.ts`.

**Interfaces:** `signIn(input:{email:string;password:string}):Promise<ActionResult<null>>`, `signOut():Promise<void>`, `requestRecovery(email:string):Promise<ActionResult<null>>`, `updatePassword(password:string):Promise<ActionResult<null>>`. All module actions depend on Task 2's `requireAdmin`; layout gating is supplementary.

- [ ] Write browser tests for anonymous redirection, successful allowlisted login, denied non-admin access, logout, safe recovery redirect handling, and expired-session save retaining form values. Assert external callback destinations cannot be used as open redirects.
- [ ] Run `npm run test:e2e -- tests/e2e/auth.spec.ts` and confirm expected failures.
- [ ] Implement cookie-based SSR clients and session refresh using verified official guidance for the installed versions. Implement login/recovery forms, protected dashboard, module navigation, private/no-store authentication responses, accessible field errors and dirty-form leave confirmation. Do not add a public signup route.
- [ ] Run auth tests and typecheck; commit `feat: add protected admin workspace`.

## Task 4: Private media lifecycle and public downloads

**Files:** `supabase/migrations/0003_media.sql`, `src/features/media/{schemas,service}.ts`, `src/app/api/media/{prepare,finalize}/route.ts`, `src/app/api/media/[id]/route.ts`, `src/components/admin/media-picker.tsx`, `tests/unit/media.test.ts`, `supabase/tests/media.sql`, `tests/e2e/media.spec.ts`.

**Interfaces:** `prepareUpload(input:{name:string;size:number;type:string}):Promise<ActionResult<{assetId:string;path:string;token:string}>>`; `finalizeUpload(assetId:string,altText:string):Promise<ActionResult<{id:string}>>`; `getMediaUrl(assetId:string):Promise<string|null>`. The URL endpoint returns 404 for inaccessible files and redirects authorized reads to a 60-second signed URL with no-store headers.

- [ ] Write validation tests for exact limits of 5*1024*1024 and 20*1024*1024 bytes, over-limit rejection, unsupported formats, spoofed extensions, missing image alt text and incomplete uploads. SQL tests must deny direct draft object reads and non-admin uploads.
- [ ] Write browser tests that publish a PDF, download it anonymously, return its parent to draft, then receive 404 for a fresh link request. Assert archived files remain available and referenced media deletion fails.
- [ ] Run unit/SQL/browser subsets and confirm missing-feature failures.
- [ ] Implement direct uploads to private Supabase Storage using admin-authorized upload tokens, avoiding large file bodies through Vercel actions. On server finalization, verify stored size and file signature against declared type before marking ready; reject and remove invalid objects. Pending objects never satisfy public-read policies. Policies cover attachment, cover, profile-photo and site-image ownership; orphan objects are admin-only.
- [ ] Implement retryable preparation/finalization, media selection, upload feedback and cleanup of abandoned pending assets through an admin cleanup action. Show expiry/read failures with retry controls.
- [ ] Run all media checks and typecheck; commit `feat: secure media uploads and downloads`.

## Task 5: News, announcements and editable organization pages

**Files:** `src/features/posts/{schemas,queries,actions}.ts`, `src/features/site/{schemas,queries,actions}.ts`, `src/lib/safe-content.tsx`, `src/components/admin/content-editor.tsx`, `src/app/admin/{news,announcements,site}/` pages, `src/app/(public)/news/` pages, `/about/page.tsx`, `/contact/page.tsx`, `tests/unit/publishing.test.ts`, `tests/e2e/publishing.spec.ts`.

**Interfaces:** `listPosts(input:ListQuery & {type?:'news'|'announcement'}):Promise<PageResult<Post>>`, `getPublicPost(slug:string):Promise<Post|null>`, `savePost(id:string|null,input:PostInput):Promise<ActionResult<{id:string}>>`, `setPostStatus(id:string,status:ContentStatus):Promise<ActionResult<null>>`, `getSiteSettings():Promise<SiteSettings>`, `saveSiteSettings(input:SiteSettingsInput):Promise<ActionResult<null>>`. `PostInput` includes title, slug, excerpt, body, type, featured/important flags and cover/attachment IDs.

- [ ] Write tests asserting drafts return 404, archives are absent from normal lists, archived filters include them, first publication sets publication time, later edits preserve slug, duplicate slugs return field errors, and body script/unsafe URL input never executes. Test persistence failure keeps entered content.
- [ ] Run `npm test -- tests/unit/publishing.test.ts` and publishing browser tests to confirm failures.
- [ ] Implement restricted Markdown without raw HTML, safe HTTP(S)/email links, paginated public lists and details, authenticated preview, status transitions, uploads and cache invalidation. Use a database constraint/trigger to preserve slugs after first publication. Reject stale updates by comparing `updated_at` so two admins do not silently overwrite each other.
- [ ] Implement editable introduction, background, description, mission, vision, objectives, contacts, social/quick links and logo selection. Validate URLs and email; absent official copy uses empty states. Build dashboard status counts/recent edits using admin-authorized queries.
- [ ] Run publishing tests, typecheck and build; commit `feat: publish news and organization content`.

## Task 6: Members, offices, academic terms and committees

**Files:** `supabase/migrations/0004_leadership.sql`, `src/features/people/{schemas,queries,actions}.ts`, `src/app/admin/{members,officers,terms,committees}/` pages, `src/app/(public)/{members,officers}/page.tsx`, `supabase/tests/leadership.sql`, `tests/e2e/people.spec.ts`.

**Interfaces:** `listPeople(input:ListQuery & {department?:string;batch?:string;committeeId?:string}):Promise<PageResult<Person>>`, `getLeadership(termId?:string):Promise<Leadership>`, `savePerson(id:string|null,input:PersonInput):Promise<ActionResult<{id:string}>>`, `assignOfficer(termId:string,positionId:string,personId:string|null):Promise<ActionResult<null>>`, `setCommitteeMembership(termId:string,committeeId:string,personId:string,role:'member'|'co_head'|null):Promise<ActionResult<null>>`, `setCurrentTerm(termId:string):Promise<ActionResult<null>>`.

- [ ] Write SQL tests for eight seeded offices/four committees; one office occupant per term/position; one co-head per term/committee; derived head equals corresponding VP; conflicts are rejected whether co-head or VP is edited first. Include a two-transaction integration check for simultaneous conflicting assignments.
- [ ] Add browser tests for person editing, search/filter URL persistence, vacant positions, term switching without historical loss, and refusal to delete referenced people.
- [ ] Run SQL and people browser tests and confirm missing behavior.
- [ ] Implement term-locked transactional assignment functions and triggers for both assignment tables so direct writes cannot bypass leadership rules. Switch current term atomically. Render eight ordered office cards and four committee panels with one linked head and one co-head each. Archive profiles while retaining historical references; public reads omit draft profiles.
- [ ] Run SQL/concurrency/browser tests and typecheck; commit `feat: manage members and committee leadership`.

## Task 7: Examination schedules and result publishing

**Files:** `src/features/examinations/{schemas,queries,actions}.ts`, `src/app/admin/{examinations,results}/` pages, public `/examinations/` and `/results/` pages and `[slug]` details, `tests/unit/examinations.test.ts`, `tests/e2e/results.spec.ts`.

**Interfaces:** `listExaminations(input:ListQuery & {period?:'upcoming'|'past'}):Promise<PageResult<Examination>>`, `saveExamination(id:string|null,input:ExaminationInput):Promise<ActionResult<{id:string}>>`, `listResults(input:ListQuery & {examinationId?:string;year?:number}):Promise<PageResult<ResultAnnouncement>>`, `saveResult(id:string|null,input:ResultInput):Promise<ActionResult<{id:string}>>`. Inputs use ISO timestamps; forms convert Manila-local input explicitly. Result input includes examination ID, body, status and ready PDF IDs.

- [ ] Write fixed-clock tests around `2026-10-21T16:00:00Z`, asserting the displayed Manila date is October 22 and upcoming/past classification compares instants correctly. Reject invalid dates and result references to unavailable examinations at publication time.
- [ ] Add end-to-end tests for schedule publication, venue/instructions/reminders, cancellation labels, result publication with PDF, examination/year filters, archive visibility and draft access rejection.
- [ ] Run targeted tests and confirm failures, then implement editors, detail/list pages, authenticated previews and cache invalidation using Tasks 4–5's media and publishing rules. A published result requires at least one ready PDF. Preserve links and filenames on download.
- [ ] Run date/result tests, typecheck and build; commit `feat: publish examination schedules and results`.

## Task 8: Activities, galleries and live homepage sections

**Files:** `src/features/activities/{schemas,queries,actions}.ts`, `src/features/site/home.ts`, `src/app/admin/activities/` pages, public `/activities/` pages, `src/app/(public)/page.tsx`, `tests/unit/home.test.ts`, `tests/e2e/activities.spec.ts`.

**Interfaces:** `listActivities(input:ListQuery & {period?:'upcoming'|'past'}):Promise<PageResult<Activity>>`, `saveActivity(id:string|null,input:ActivityInput):Promise<ActionResult<{id:string}>>`, `getHomeContent(nowIso:string):Promise<HomeContent>`. `ActivityInput` includes title, slug, body, start/end, venue, highlights, cover ID and ordered `{assetId,caption}` gallery entries. `HomeContent` contains settings, three featured posts, three important announcements, one next examination, three recent results and three upcoming/ongoing activities.

- [ ] Write fixed-clock tests excluding archived/draft home items, ordering the next examination correctly, treating ongoing activities as current until their end, and rejecting end-before-start. Test stable gallery ordering and invisible draft images.
- [ ] Add browser tests for activity publish/edit/archive, gallery captions and keyboard viewing, then homepage updates after each published mutation.
- [ ] Run targeted tests and confirm failures. Implement activity forms, public pages and galleries, then aggregate actual published content into the homepage. Show useful empty sections without fake statistics or fabricated events. Use the supplied logo as the central brand image.
- [ ] Run tests, typecheck and build; commit `feat: publish activities and connect homepage`.

## Task 9: Release verification, metadata and editor guidance

**Files:** `src/app/{sitemap,robots}.ts`, public route metadata, shared error/not-found/loading pages, `tests/e2e/{release,accessibility}.spec.ts`, `README.md`, `docs/{deployment,editor-guide,vibe-coding}.md`, `.env.example`, CI workflow.

**Interfaces:** Use canonical `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; no committed credentials. Generate sitemap entries only for publicly readable content. Admin pages set noindex and remain protected independently of robots rules.

- [ ] Write release browser tests for all public routes at 390px and 1440px, keyboard navigation/focus, labels, empty lists, invalid slug 404, network-save failure retaining inputs, and upload/session expiry. Run accessibility checks on representative public and admin pages.
- [ ] Implement metadata, share images using the real logo, sitemap, robots, graceful retry/error states, and any fixes demonstrated by these checks. Use static organization fallbacks only where true; missing backend configuration must be clearly identified during setup.
- [ ] Document migration execution, disabling public signup, initial admin creation/allowlisting, auth redirect settings, environment variables, direct upload lifecycle, backup/restore responsibilities, Vercel deployment and content entry. Provide per-milestone vibe-coding prompts referencing the approved spec, test commands and completed checklist state.
- [ ] Run `npm test`, `npm run test:db`, `npm run typecheck`, `npm run build`, `npm run test:e2e`. Record actual results and any unavailable integration environment. Commit `chore: verify release and document operations`.

## Task 10: Connect real services and deploy

**Files:** `docs/deployment.md` and release verification record; environment configuration through provider tooling.

**Consumes:** Tested application, SQL migrations, verified project access, canonical deployment URL and initial administrator. **Produces:** Vercel deployment URL with a connected Supabase database/storage/auth system.

- [ ] Inspect available Vercel/Supabase integrations. If access is missing, ask for the project connection or have the user configure provider settings; never request secrets in chat or create substitute demo persistence.
- [ ] Apply reviewed migrations to the intended Supabase project, create storage configuration, provision the initial admin, and configure Auth redirects. Confirm RLS is enabled and public registration disabled.
- [ ] Configure Vercel environment variables and deploy the pinned repository. Keep preview environments separate from production data when possible; document any intentional shared project.
- [ ] Run deployed smoke tests for public navigation, allowlisted sign-in, draft/public transitions and a test-file download. Run authorization checks using dedicated test fixtures, then clean up only those fixtures.
- [ ] Record URL, actual checks, remaining real-content entry and any provider blockers. Claim a live launch only after these checks pass; otherwise hand over the runnable source and exact pending setup steps.

## Self-review and execution handoff

Coverage checked: all ten requested feature groups have owning tasks; About/Contact/home editing is in Tasks 5 and 8; all eight core roles/four committees are in Task 6. Authentication, storage access, archives, term history, error behavior and launch verification have explicit checks. Shared contracts are defined before use; domain types are derived from migrations and shared Zod schemas within each feature.

Recommended execution: **Native**, implementing each task in order in the current chat. The features depend on shared database/auth/media interfaces, so keeping implementation context together is efficient. A whole-application review follows the release checks. **Subagent-driven** execution is the alternative: fresh implementers and reviewers per task, with higher context usage and more independent intermediate review.

User review of this plan and execution-method selection are required by the invoked Superpowers workflow before product implementation starts. Approval of the design has already been recorded; do not request it again.
