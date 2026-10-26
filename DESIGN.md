---
name: UDD-SAGE
description: A professional academic identity led by the organization seal.
colors:
  navy: "#101a48"
  deep: "#0b1233"
  ink: "#202b45"
  gold: "#d4af4f"
  paper: "#ffffff"
  muted: "#5f697c"
  line: "#dfe4ed"
  sage: "#485a7d"
  quiet-surface: "#f8f9fc"
  section-surface: "#f3f5f9"
  hero-action: "#e4c36f"
  hero-action-hover: "#f0d28a"
  focus: "#846515"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(42px, 4.3vw, 62px)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(27px, 2.8vw, 36px)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  page-title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(32px, 3.8vw, 48px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.7
  button:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.2em"
rounded:
  seal: "50%"
  button: "5px"
  icon: "6px"
  surface: "8px"
spacing:
  control-gap: "12px"
  mobile-gutter: "20px"
  card-inset: "28px"
  mobile-section: "44px"
  desktop-section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "13px 22px"
  button-hero:
    backgroundColor: "{colors.hero-action}"
    textColor: "{colors.navy}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "13px 22px"
  button-hero-hover:
    backgroundColor: "{colors.hero-action-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "13px 22px"
  content-card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.surface}"
    padding: "28px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "11px 12px"
  empty-state:
    backgroundColor: "{colors.quiet-surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.surface}"
---

# Design System: UDD-SAGE

## Overview

**Creative North Star: "Professional Academic Identity"**

The unchanged organization seal anchors a confident, orderly academic identity. Navy establishes institutional presence; white and pale surfaces keep published information readable; restrained gold marks emphasis and important actions. Bold sans-serif headings give the system a clear hierarchy without theatrical decoration.

The implementation replaces the illustrated landscape with straightforward organization content and structured navigation. This document records the implemented cascade, rather than inactive artwork or earlier styles.

**Key Characteristics:**

- Seal-led identity and restrained gold emphasis.
- Bold Manrope headings with readable DM Sans body text.
- Structured grids, quiet borders and compact corner radii.
- Brief interaction feedback with reduced-motion support.

Sources: `src/app/layout.tsx` imports `globals.css` before `academic.css`; the latter's final institutional identity block overrides earlier declarations. Product commitments are in `PRODUCT.md`; the approved direction is in `docs/superpowers/specs/2026-10-26-academic-ui-design.md`.

## Colors

### Primary

- **Academic Navy** (`navy`) anchors headings, primary buttons, the introduction and navigation.
- **Deep Navy** (`deep`) supports the footer.

### Secondary

- **Seal Gold** (`gold`) supplies thin identity rules and restrained accents.
- **Action Gold** (`hero-action`) provides contrast for the introduction's principal action; its hover token brightens the same surface.

### Neutral

- **Paper White** (`paper`) is the page and content-card surface.
- **Quiet Surface** and **Section Surface** distinguish empty states, seal presentation and section bands.
- **Ink**, **Muted**, **Line** and **Sage** separate reading text, supporting text, borders and secondary icons.
- **Focus** is the dark gold keyboard outline, distinct from decorative gold.

**The Seal Authority Rule.** Keep the supplied seal unchanged; use its navy, white and gold context to establish identity without adding scene illustration.

## Typography

**Display Font:** Manrope, with Arial and sans-serif fallbacks.
**Body Font:** DM Sans, with Arial and sans-serif fallbacks.

Both families are bundled locally through `next/font/local`. Headings are compact, bold and balanced; body copy remains open and readable. Display and section-heading values are recorded in frontmatter. The public introduction uses the heavier display role; interior page headings use `page-title`. Uppercase eyebrows use the label role, with context-specific tracking overrides.

Body text inherits the body role. Article prose uses a generous line height (1.85) and a reading width (70ch); page introductions are constrained to 65ch. Hero support text is smaller (15px), with generous leading. At 1150px the hero display becomes `clamp(39px, 4.4vw, 56px)`; at 950px it becomes 40px; at 650px it becomes `clamp(35px, 9.5vw, 47px)`. Mobile page titles are 34px.

The retained stylesheet uses Georgia for some incidental emphasis, value numerals and avatar initials. Public section-heading emphasis explicitly inherits Manrope and is upright; do not treat Georgia as a display identity.

## Layout

The centered public container caps at 1200px and uses 48px outer gutters. At 1150px, gutters become 28px; at 650px, they become 20px. Public sections use the desktop-section rhythm and switch to mobile-section at 650px. Content cards use three columns and become one column on mobile. Directory layouts have their own responsive grids, including a dedicated executive row on desktop.

The introduction pairs copy with a circular seal presentation directly on navy in an asymmetric two-column grid. Three thin gold rings expand and fade around the stationary logo on staggered 14-second cycles. The desktop seal is approximately 328px wide at a 1440px viewport; mobile retains its compact size. At 650px the layout stacks, with a centered 230px orbit above the caption. Navigation collapses at 950px into a two-column menu with scroll containment. Preserve the existing mobile controls, skip link and reading order.

## Elevation & Depth

Borders and surface changes supply most depth. The seal sits directly on navy with a restrained drop shadow and gold orbital linework. The decorative ripples have no controls, as requested, and become a static ring under reduced-motion preferences. Content cards add a modest hover shadow (`0 12px 25px #1c24300f`) and move upward (2px). The mobile menu has a quiet structural shadow; the schedule dialog has a stronger overlay shadow. Buttons change color without translating. Do not add ambient scenery.

Interactions generally transition color, background, border and shadow over 0.2s; transforms use 0.3s with the established ease curve. Reduced-motion preferences disable animation and transitions. Exact motion and exceptional shadows are recorded in the sidecar.

## Shapes

Use the frontmatter's compact button, icon and surface radii. The seal frame is circular, with no white rectangular surface. Repeated panels use fine borders; directory avatars remain circular. Existing member pills and publication badges keep their fully rounded shapes. The schedule notice retains its larger dialog radius (16px); it is an exception rather than a card default.

## Components

### Buttons

Primary buttons use navy and white. The introduction's gold action is scoped to its dark context; the general gold-button variant elsewhere retains its existing warmer gold surface. Secondary buttons use white with an ink label and quiet border. Shared controls have a minimum height (46px); primary hover becomes `#263466`, and secondary hover becomes `#edf0f6`. Disabled buttons lower opacity and suppress movement.

### Inputs / Fields

White fields use the input token, a gray border (`#bcbebd`), 16px text and a minimum height (46px). Hover strengthens the border; focus changes it to navy. Textareas retain their taller minimum height (120px). Keyboard focus uses a 3px outline with a 4px offset.

### Navigation

Navigation uses compact DM Sans labels (12px, 600). Desktop active links have a gold bottom rule; hover shifts text to dark gold. On mobile, the active item also has a pale background and compact rounding. Link targets retain a minimum height (44px).

### Cards / Containers

Publication cards are white, bordered and lightly rounded, with card-body inset from frontmatter. Their image area can carry actual published imagery. Empty states use the quiet surface, centered text and a smaller tinted icon block. Academic link panels group rows with dividers rather than individual floating cards. Admin cards and media panels share the surface radius.

### Chips / Badges

Member pills are small, pale, fully rounded labels. Publication badges communicate published and draft status through established green and warm gold treatments. These are status metadata, not a new primary action style.

## Do's and Don'ts

### Do:

- **Do** keep the supplied seal unchanged and clearly legible.
- **Do** use bold Manrope for primary public headings and DM Sans for reading and controls.
- **Do** use the final academic stylesheet cascade when extending an existing component.
- **Do** preserve visible keyboard focus, mobile behavior and reduced-motion support.
- **Do** use published content and actual organization data.

### Don't:

- **Don't** restore the illustrated landscape or atmospheric motion as the visual identity.
- **Don't** invent people, achievements, results, dates, statistics or campus photography.
- **Don't** enlarge all corners or add floating shadows to every panel.
- **Don't** introduce a replacement logo, decorative display font or unrelated accent palette.

