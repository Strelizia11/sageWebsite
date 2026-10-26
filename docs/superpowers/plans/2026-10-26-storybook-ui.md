# Storybook UI Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver the approved balanced storybook UI across the existing UDD-SAGE website.
**Architecture:** Retain server-rendered data and content. Add one original local hero illustration and a small client component for ambient motion control. Refine the shared CSS and navigation without changing data or auth.
**Tech Stack:** Existing Next.js, React, TypeScript, CSS, Lucide.
**Spec:** docs/superpowers/specs/2026-10-26-storybook-ui-design.md

## Global Constraints
Preserve logo, routes, factual content, Supabase behavior, and existing dependencies. Use navy, ivory, and gold with restrained colors from the logo. Respect reduced motion. Keep admin task-focused.

## Review Focus
Mobile menu keyboard and route changes; long titles and narrow screens; text contrast over art; reduced motion and paused scenery; admin controls with shared styling.

### Task 1: Illustrated homepage and motion
Files: public/sage-landscape.webp; src/components/storybook-scene.tsx; src/app/(public)/page.tsx; src/app/globals.css.
- [x] Generate an original fictional landscape and optimize into the project.
- [x] Build decorative scene with a persistent accessible pause/play control and reduced-motion handling.
- [x] Preserve organization copy, actions, and current database-driven homepage sections.
- [x] Verify artwork dimensions, keyboard control, and responsive cropping.

### Task 2: Coherent shared UI and navigation
Files: src/components/header.tsx; src/components/ui.tsx; src/app/(public)/layout.tsx; src/app/globals.css.
- [x] Refine typography, surfaces, cards, filters, empty states, footer, and readable admin controls.
- [x] Improve mobile menu dismissal, focus handling, and current-page semantics.
- [x] Preserve every route and form action.

### Task 3: Verification
Files: tests/e2e/public.spec.ts; docs/superpowers/specs/2026-10-26-storybook-ui-verification.md.
- [x] Exercise pause state, reduced motion, mobile keyboard menu, and overflow in browser coverage.
- [x] Run unit tests, TypeScript check, and production build.
- [x] Inspect desktop and mobile in a batched pass, fix findings, and confirm once.
- [x] Obtain independent final code review and record verification limitations.

Execution: Native implementation in the current user workspace, authorized by the user’s go-ahead. No automatic commits or remote publication.

