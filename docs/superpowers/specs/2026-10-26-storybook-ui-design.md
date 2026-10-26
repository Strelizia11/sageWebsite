# UDD-SAGE balanced storybook UI design

Date: 2026-10-26
Status: Approved by the user on 2026-10-26; implemented

## Intent
Improve the existing website’s usability and visual coherence while introducing a balanced Ghibli-inspired atmosphere. The user selected an illustrated homepage with subtle motion elsewhere.

## Visual direction
Preserve the supplied logo unchanged. Use its deep navy as the principal identity color, ivory for readable surfaces, and gold for emphasis. Use restrained blue, green, red, orange, and violet accents drawn from the seal. Natural scenery complements the identity rather than replacing it with a green theme.

The homepage hero combines existing organization copy and clear actions with an original softly painted landscape inspired by hand-painted animation backgrounds. Keep text on a quiet, high-contrast surface. Frame the unchanged seal deliberately within the composition. Slow clouds, occasional drifting leaves, and gentle light provide atmosphere without obscuring content.

## UX and cross-page reach
Refine shared typography, spacing, navigation, buttons, filters, cards, empty states, and footer so public pages feel related. Preserve route structure, factual copy, search, pagination, publishing, authentication, and media behavior. Improve mobile navigation and keyboard affordances where inspection identifies gaps. Keep admin forms compact, readable, and task-focused; carry shared colors and controls into administration without animated scenery.

## Motion and accessibility
Use lightweight transform/opacity animation, clear hover and focus feedback, and restrained entrances. No scroll hijacking, custom cursors, or blocking intro. Respect prefers-reduced-motion and keep decorative artwork hidden from assistive technology. Ensure readable contrast, mobile reflow, and useful touch targets.

## Approaches
Recommended builder choice: one original illustrated hero background with lightweight CSS atmospheric layers. It offers a coherent scene with manageable performance and complexity.
Alternative: a fully layered animated scene across public pages. More immersive, but adds motion, maintenance, and visual competition with schedules and results.
Alternative: retain the existing composition and add only subtle natural motion. Least disruptive, but does not deliver the selected illustrated-homepage direction.

## Constraints and non-goals
Keep Next.js, React, TypeScript, Supabase, and the existing icon family. Read the installed Next.js guides before implementation. Do not invent organization facts, people, dates, or result data. Do not change database or authorization behavior. No unrelated dependency or infrastructure upgrades.

## Builder decisions and validation
The builder chooses scene details, responsive composition, motion timings, and token values consistent with this direction. Inspect the existing site before editing. Verify desktop and mobile together, apply one consolidated fix pass, and confirm. Run TypeScript, unit tests, and a production build; run browser checks where the environment permits. Report limitations honestly.

