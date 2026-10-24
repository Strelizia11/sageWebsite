# UDD-SAGE

Official website for **Universidad de Dagupan – Scholars’ Association for Greater Excellence**.

Next.js + React + TypeScript, deployable on Vercel, with Supabase PostgreSQL, Auth and private Storage.

## Run locally

Use Node.js 24 LTS (or a compatible Node 22 release).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell use `Copy-Item .env.example .env.local` and `npm.cmd` if execution policy blocks `npm.ps1`.

Open http://localhost:3000. Public pages render honest empty states without Supabase configuration. Admin sign-in requires a configured Supabase project; there is no fake/local administrator or embedded password.

## Features

- Responsive public Home, About, News, Officers, Members, Examinations, Results, Activities and Contact pages.
- Admin login/recovery, editing, drafts, publication, public archives, search, pagination, image/PDF uploads and previews.
- Eight core positions, four committees, VP-derived heads, one co-head per committee per academic term.
- PostgreSQL RLS, constrained leadership assignments, immutable published slugs and stale-edit protection.
- Private file storage with parent-aware read policies and short-lived public download links.

## Verify

```sh
npm test
npm run test:db
npm run typecheck
npm run build
npm run test:e2e
```

Database tests run the real migration and role policies in embedded PostgreSQL (PGlite), with minimal Auth/Storage schema fixtures. They do not replace live Supabase Auth/Storage verification. Browser tests use installed Microsoft Edge; use a supported Playwright browser/channel on other platforms.

## Documentation

- [Deployment and admin bootstrap](docs/deployment.md)
- [Editor guide](docs/editor-guide.md)
- [Vibe-coding workflow](docs/vibe-coding.md)
- [Approved design](docs/superpowers/udd-sage-design.md)
- [Implementation plan](docs/superpowers/udd-sage-implementation-plan.md)
- [Verification record](docs/verification.md)

No real officer profiles, results, mission statements or contact details are fabricated. Enter official content through the dashboard after setup.
