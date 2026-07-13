# kennyvws.dev — Rauno-Philosophy Redesign Spec ("Quiet Precision, spoken once")

**Date:** 2026-07-13
**Status:** Approved by Kenny (approach, accent policy, signature interaction, closing line)
**Extends:** `2026-07-12-kenny-portfolio-design.md` — the base "Quiet Precision" system stays;
this spec changes how it speaks.
**Reference:** rauno.me — interaction philosophy and typographic confidence only. None of its
copy, content, branding, or token names are used. Kenny's content, palette, and accent blue
are kept.

## Goal

Apply five borrowed principles to the existing single-page portfolio:

1. One piece of copy as the literal hero — no headline/subhead split.
2. Colorless links and nav — motion signals interactivity, not accent color.
3. Exactly ONE obsessed-over micro-interaction: cursor-proximate term previews.
4. Long continuous scroll — de-boxed sections that breathe into each other.
5. A point-of-view closing statement, not a repeated CTA.

## Approach (decided)

Restyle **within the existing architecture**. `Section`, `Reveal`, the data layer, nav focus
trap, scroll-spy, and theming are kept. No teardown, no new dependencies.

**Starting state:** the working tree already carries an uncommitted partial pass in this
direction (section eyebrows removed, hero name/role line and status grid removed, Skills
de-carded, read times dropped, plus unrelated small fixes to Navbar scroll handling and
metadata DRY). Implementation builds on top of that diff; it is kept, not reverted.

## Decisions made with Kenny

| Decision | Choice |
|---|---|
| Projects section | Full editorial list — cards, filter pills, tag pills, and `featured` layout all removed |
| Accent usage | One accent moment: the Contact email CTA keeps the filled accent pill. Accent otherwise only in status dot, focus rings, `::selection` |
| Signature interaction | Term previews: dotted-underlined inline terms reveal a small context card near the cursor |
| Closing statement | "Clean the data. Fight the training run. Ship the server." |

## Design

### 1. Hero — the sentence is the hero

- Delete the H1 + sub-copy split. The H1 becomes the full pitch verbatim:
  *"I build machine learning systems end to end: computer vision and LLM tooling, from the
  training loop to the server that keeps it running."*
- Size `clamp(1.9rem, 1rem + 3vw, 3.25rem)`, `leading-[1.15]`, `tracking-tight`,
  `max-w-4xl`, `text-balance` — 3–4 confident lines, semibold.
- Status pill loses border/background/shadow: plain small text, blue dot + "Open to AI
  Engineer roles".
- CTAs become body-colored text links with the underline-draw treatment:
  "See projects →" (→ `#work`) and "GitHub ↗". `ButtonLink` is no longer imported here.
- Three hero terms carry the signature preview (see §3).

### 2. Site-wide link language (colorless + underline-draw)

- One CSS utility (in `globals.css`, e.g. `.link-draw`): `position: relative`; 1px
  `::after` bar in `currentColor`; `transform: scaleX(0)` → `scaleX(1)` on hover/focus;
  `transform-origin` left on enter, right on leave (origin switch via `:not(:hover)`);
  ~200ms expo-out. Compositor-only (transform).
- Applied to: desktop nav items, hero CTAs, project entry links, Contact social links,
  footer "Back to top".
- Nav active state: remove the `bg-surface-muted` pill. Active = `text-ink` + persistent
  underline (`scaleX(1)`); inactive = `text-ink-muted`, hover → ink + draw. `aria-current`
  behavior unchanged.
- All `hover:text-accent` and `text-accent` copy styling is removed (project blurbs, project
  links). Focus rings and `::selection` keep accent.
- Mobile menu sheet rows keep their existing hover background (control surface, not page
  content).

### 3. Signature interaction — `TermPreview`

**Files:** `src/components/ui/TermPreview.tsx`, `src/data/terms.ts`.

**Data.** `terms.ts` exports a typed map; `TermPreview` takes `term: TermId` so a missing id
is a compile error. Each entry: `title` + `meta` line(s). All copy is sourced from existing
site data — nothing invented:

| Term (location) | Preview title | Preview meta |
|---|---|---|
| "computer vision" (hero) | Semi-Supervised PPE Detection | YOLOv9 · research, in submission to Automation in Construction |
| "LLM tooling" (hero) | RAG eval harness · doc Q&A agent | Local-first, measured before trusted |
| "the server" (hero) | Linux homeserver | Docker · self-hosted, monitored |
| "semi-supervised YOLOv9 pipeline" (About ¶1) | Semi-Supervised PPE Detection | 2025 · Research, in submission |

Exactly these four in v1. Adding a term = one data entry + one inline wrap.

**Resting affordance.** 1px dotted underline in `ink-muted` (`text-decoration: underline
dotted` or border-bottom), visually distinct from the solid motion underline of real links.
Rendered **only** under `@media (hover: hover) and (pointer: fine)` — on touch devices the
term is plain text and nothing advertises an unavailable interaction.

**Pointer behavior.** On hover, a small card (~260px max-width, `rounded-xl`, `bg-raised`,
`border-edge`, `shadow-soft`) fades + scales in (~150ms, 2px scale delta, expo-out) near the
cursor with a fixed offset, `position: fixed` at cursor coordinates, clamped to the viewport.
It tracks the cursor with a spring lag (motion `useMotionValue` + `useSpring`). Transform and
opacity only.

**Keyboard.** The term is focusable; on focus the card appears anchored below the term (no
cursor coords). `role="tooltip"` on the card, `aria-describedby` from the term to the card
id; Escape closes; blur closes. Content stays in the DOM (visibility-toggled) so the
description is always resolvable.

**Reduced motion.** Opacity fade only — no scale, no cursor tracking (static position at
entry point / below term).

**SSR.** Terms render server-side as plain spans; the preview layer is a client enhancement.
No hydration flash, no layout shift.

### 4. De-boxing for continuous scroll

- **Projects → editorial list.** Delete filter state, filter pills, `AnimatePresence`
  re-layout, card chrome, `Tag` pills, and the `featured` layout span. Render `ul` with
  `divide-y divide-edge border-y border-edge` (mirroring Writing). Each entry (`py-8`):
  - Row 1: `h3` title (`text-xl font-semibold tracking-tight`) + right-aligned
    "`{year} · {status}`" in muted sm.
  - Row 2: blurb as an ink-colored medium-weight lead line (accent removed), description
    below in muted `[15px]`.
  - Row 3 (muted, small): "`{category} · {tags joined by ' · '}`" then "GitHub ↗" /
    "Paper ↗" text links (ink-muted → ink, underline-draw).
  - `Reveal` stagger kept. Source order of `projects` array unchanged (PPE first).
- **`featured` field** removed from `Project` interface and data (no remaining consumer).
- **About facts** (Training / Shipping / Writing): cards → hairline blocks matching the
  de-carded Skills treatment (`border-t border-edge pt-6`, 15px semibold title, muted body).
  Grid position unchanged.
- **Writing:** "Draft" chip becomes plain text — meta line reads
  "`Draft · {tag} · {formatDate(date)}`". Chip span deleted.
- **Contact socials:** icon circles → text link row "GitHub · LinkedIn · X" with
  underline-draw. `react-icons` imports leave `Contact.tsx` (the package stays — Skills
  uses it).
- **Orphan removal (created by this change):** `Tag.tsx`; `ButtonLink`'s `quiet` variant
  (component slims to the single filled style, used once).
- **Deliberately still boxed:** email CTA pill, term-preview card, mobile nav sheet, theme
  toggle. Nothing else.

### 5. One accent moment

The Contact `mailto:` CTA keeps the filled accent pill — the only filled element on the
page. Everything else interactive is body-colored text + motion.

### 6. POV closing

At the end of the Contact section — after the CTA and social row, before the footer — the
closing statement, its own `Reveal`:

> **Clean the data. Fight the training run. Ship the server.**

Set at ~`text-3xl` semibold, `tracking-tight`, ink, generous top margin (`mt-20`-ish),
left-aligned in the same container. It is the last narrative element; the footer below stays
utilitarian (©, back-to-top). Stored in `src/data/site.ts` (`contact.closing`) per the
data-layer convention. This is the only net-new copy in the project.

## Copy & content rules

- No invented facts. Preview copy and the closing line are remixes of existing site data
  (verified against `site.ts`, `projects.ts` sources above).
- All structured content stays in `src/data/`; components hardcode only display headlines.

## Files touched (expected)

- **New:** `src/components/ui/TermPreview.tsx`, `src/data/terms.ts`.
- **Modified:** `globals.css` (link-draw utility, dotted-term style), `Hero.tsx`,
  `Navbar.tsx` (active-state restyle only), `About.tsx`, `Projects.tsx`, `Writing.tsx`,
  `Contact.tsx`, `Footer.tsx` (link-draw on back-to-top), `ButtonLink.tsx`,
  `src/data/projects.ts` (drop `featured`), `src/data/site.ts` (add `contact.closing`),
  README (direction note).
- **Deleted:** `src/components/ui/Tag.tsx`.
- **Tests:** see below.

## Verification

- **Unit (vitest):** existing data tests stay; add terms-data integrity (four entries,
  non-empty title/meta). Remove nothing else.
- **E2E (Playwright):**
  - Replace the project-filter test with: `#work` list renders 5 entries, PPE entry first.
  - New signature coverage: hovering "computer vision" in the hero shows a tooltip
    containing "PPE"; keyboard focus on the term shows it; Escape hides it.
  - Existing tests must stay green untouched: hero H1 contains "machine learning systems"
    (the full-pitch H1 still does), status text visible, nav anchor scroll, resume href,
    theme persistence, mobile-menu focus trap.
- **Screenshots:** re-capture 320 / 768 / 1024 / 1440, light + dark; visually review before
  calling done.
- **Static:** `next build`, `tsc --noEmit`, ESLint — all clean. No new dependencies; JS
  budget unaffected.
- **A11y:** tooltip pattern per §3; colorless links are ink-on-surface (AA holds); dotted
  underline never the only affordance for a *navigational* action (previews are
  supplementary content).

## Out of scope

- Everything listed in the base spec's out-of-scope (CMS, resume PDF, analytics, forms, i18n).
- Term previews on touch devices (deliberately absent, not deferred).
- Any change to theming, fonts, palette tokens, or section order.

## Open TODOs carried over from base spec (unchanged)

Resume PDF, repo slugs, PPE paper link, LinkedIn URL.
