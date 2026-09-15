# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

`kennyvws.dev` is a personal portfolio single-page site built with Next.js App Router, Tailwind CSS v4, `motion` (v12), and `next-themes`. The design direction is "Quiet Precision" (Apple-HIG-inspired) evolved with a rauno.me interaction philosophy: single-sentence hero, colorless motion-affordance links, cursor-proximate term previews, one accent moment, and a POV closing statement.

## Key Architecture

### Content Layer (`src/data/`)
All copy lives in data files — section components hardcode only their display headlines.
- `site.ts` — site metadata, about paragraphs/facts, contact framing/closing, socials
- `nav.ts` — nav items and derived `sectionIds`
- `projects.ts` — project list with categories, tags, status, featured flag
- `skills.ts` — grouped skill list with optional react-icons
- `posts.ts` — writing drafts (all `href: "#"` until published)
- `terms.ts` — term preview entries (title + meta) keyed by `TermId`

### UI Primitives (`src/components/ui/`)
- `Section` — wraps a section with id, aria-labelledby, scroll-mt, max-width container
- `Reveal` — `motion.div` with `whileInView`, viewport once, role-based entrance variants
- `TermPreview` — cursor-proximate popup card (portal + AnimatePresence), keyboard accessible
- `ButtonLink` — accent CTA pill with hover/active scale

### Sections (`src/components/sections/`)
Each maps to a nav item and a `sectionId` in `src/data/nav.ts`: Hero, About, Skills, Projects, Writing, Contact, Footer, Navbar.

### Artifacts (`src/components/artifacts/`)
Canvas/SVG visual plates that repeat the Reticle frame motif: `DetectionFrame` (hero), `ProjectArtifact` (per-project, switches by category), `SignalTrace`, `TokenStream`, `Reticle` (corner-bracket frame).
- `SignalTrace` is **scroll-scrubbed**, not scroll-triggered: `useScroll` + `useTransform` bind the curve's `pathLength` and the live `step` readout to the plate's travel up the viewport. The one intentional departure from "animate once, rest" — scroll is the training step, which is the only place on the page where scroll maps to meaning rather than decoration.
- Reduced motion renders a plain `<path>`/`<circle>` (full curve, static max step), **not** a `motion.path` with `pathLength: 1` — Motion emits `stroke-dasharray="0 1"` for that, which draws nothing.

### Motion (`src/lib/motion.ts`)
Shared easing curves, spring configs, durations, and the `reveal()` function (role-specific variants: heading, body, artifact) plus `staggerParent`.

### Hooks
- `useActiveSection` — IntersectionObserver scroll-spy for nav active state

### Styling
- `src/app/globals.css` — CSS custom properties for light/dark themes, `@theme inline` for Tailwind, `link-draw` underline animation, `term-trigger` dotted underline, reduced-motion overrides
- Tailwind v4 with `@import "tailwindcss"` and `@custom-variant dark`

## Commands

```bash
npm run dev        # dev server on :3000
npm run build      # production build
npm run start      # start production server on :3000
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run test       # vitest run (unit tests in tests/unit/)
npm run e2e        # playwright test (E2E in tests/e2e/)
```

Run a single unit test: `npx vitest run tests/unit/data.test.ts`

## Design Constraints (Non-Negotiable)

- Accent color (`--accent`) appears in exactly: Contact email `ButtonLink`, hero status dot, `:focus-visible` outline, `::selection`. Nowhere else.
- Links use motion (underline draw), not color, to signal interactivity.
- `MotionConfig reducedMotion="user"` is set in `layout.tsx` — all motion components must respect it.
- Compositor-only animation properties (`transform`, `opacity`) — no layout-bound property animation.
- All content copy lives in `src/data/` — never hardcode section copy in components.
- The hero H1 must equal `site.pitch` verbatim.
- Text links need ≥44px hit areas (`min-h-11` + `inline-flex items-center`).

## Testing

- Unit tests (Vitest): `tests/unit/` — data integrity, utils, terms validation
- E2E tests (Playwright): `tests/e2e/` — smoke tests + screenshot regression at 4 breakpoints (320, 768, 1024, 1440) in both light and dark themes
- E2E base URL: `http://localhost:3100` (build + start required before running e2e)
