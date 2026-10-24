# Deploy to Vercel and Supabase

## 1. Supabase project

Create a Supabase project in your account. Save the database password in your password manager. Run every SQL file in `supabase/migrations/` in filename order using the Supabase SQL Editor, or track them with the Supabase CLI. Run a migration only once. The migration creates the schema, eight positions, four committees, organization settings, access policies and private `sage-media` bucket.

In Authentication settings, disable public account signup. Configure the Site URL and allowed redirect URLs for your local and deployed website, including `/auth/callback`.

Use a separate Supabase project for development when possible. Do not point a public preview environment at confidential production drafts.

## 2. First administrator

Create the administrator through Supabase Authentication → Users (invite or create a user). Copy that user's UUID, then run this in the SQL Editor, replacing the sample UUID:

```sql
insert into public.admin_users(user_id)
values ('REPLACE_WITH_THE_AUTH_USER_UUID');
```

The UI does not grant administrator access. Repeat this deliberate allowlist step for each authorized administrator. Removing the allowlist entry immediately removes content permissions, even if the user remains signed in. Do not share credentials.

Configure Supabase email delivery before relying on invitations/password recovery. Test recovery on the final domain.

## 3. Environment variables

Copy `.env.example` to `.env.local` for local development:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_OR_SERVICE_ROLE_KEY
```

Use the publishable key for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The application uses the administrator's session and database policies for content writes. `SUPABASE_SECRET_KEY` is a separate server-only secret used exclusively by the media download signer, after a normal RLS query confirms the requested asset is visible. It must never have a `NEXT_PUBLIC_` prefix, appear in client code, or be committed. Anonymous users cannot directly mint arbitrary-duration Storage URLs.

## 4. Vercel

Push this repository to your chosen Git provider and import it into Vercel. Framework: Next.js. Root directory: the directory containing `package.json`. Install: `npm ci`; build: `npm run build`. Set the four variables above for the intended environments. Set `NEXT_PUBLIC_SITE_URL` to the full deployed HTTPS origin and configure the same origin in Supabase Auth.

Deploy, then add your custom domain if desired. The local preview is not a public deployment.

## 5. Uploads

The browser uploads directly to private Supabase Storage using a short-lived, admin-authorized upload token. A server finalization request checks size, basic file signature and image alternative text before making the file available for attachment. This avoids sending 20 MB result files through Vercel form bodies.

Published and archived parent content permits public file reads. Draft/orphan files are admin-only. Download routes issue signed URLs valid for 60 seconds. Withdrawing content cannot revoke a URL already issued until it expires; a downloaded copy cannot be recalled.

Use the media library to remove abandoned pending uploads. Foreign keys prevent deletion of attached assets. If storage cleanup fails after an unreferenced media record is deleted, remove that orphan object through the Supabase Storage dashboard.

## 6. Launch verification

1. Confirm anonymous visitors cannot read drafts or mutate tables through Supabase APIs.
2. Confirm an authenticated user absent from `admin_users` cannot edit or grant themselves admin privileges.
3. Sign in as an admin; create a draft with a photo; preview; publish; view anonymously; archive; return to draft.
4. Publish an examination, upload a PDF and publish its result. Confirm public download and denial after withdrawal.
5. Test VP/co-head conflicts and term switching. A separate multi-session database test is required to validate simultaneous conflicting writes in the hosted environment.
6. Check desktop/mobile navigation, contact links, sitemap, page titles and recovery email.
7. Enter the actual mission, vision, objectives, member profiles and official contact details.

Document the deployed URL and evidence in `docs/verification.md`. Until Auth/Storage and these live checks pass, describe the deliverable as locally verified source ready for connection, not a verified production launch.

## Operations

Keep database backups and Storage object backups according to the organization's requirements and provider plan. Verify recovery rather than assuming a database backup includes files. Review admin membership at officer turnover. Store schema changes as new migrations; do not edit applied production migrations. Do not run test fixtures against the production database.
