# Continuing with AI-assisted development

Keep the approved design and plan available in every coding session. Build one complete user flow at a time, verify it, then commit. Keep secrets in environment configuration and real organizational data out of disposable test fixtures.

## Reusable prompt

> Read README.md, docs/superpowers/udd-sage-design.md and docs/verification.md first. Implement [one concrete change] while preserving public-read/admin-write rules, term history and draft media privacy. Explain the acceptance checks, write a test that demonstrates the missing behavior, implement it, run relevant tests plus typecheck/build, and report actual results. Do not deploy to production or invent organizational information.

## Useful next sessions

- Connect a real Supabase development project and verify sign-in, publishing and file upload end to end.
- Enter the approved organization copy and official members/officers for the current academic term.
- Deploy this repository to Vercel, configure the domain and verify recovery redirects and public downloads.
- Add a new feature only after specifying its public/admin visibility and database policy implications.

## Commands

`npm test`: domain validation. `npm run test:db`: migration/RLS/constraint tests in embedded PostgreSQL. `npm run typecheck`: TypeScript. `npm run build`: production bundle. `npm run test:e2e`: browser checks with installed Edge.

Review the actual code diff before committing. Preserve the supplied logo and never let generated placeholder people or results masquerade as official content.
