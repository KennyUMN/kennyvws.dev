# kennyvws.dev — Personal Portfolio Design Spec

**Date:** 2026-07-12
**Status:** Approved by Kenny (design direction: "Quiet Precision")
**Source brief:** `fable-portfolio-prompt.md` (agent-mode output, 2026-07-12). All copy, project data,
skills, writing entries, and contact details come from that brief verbatim — no invented facts.

## Goal

A single-page personal portfolio for Kenny (Bersama), CS student at UMN heading toward AI
engineering. Held to an Apple Developer Academy bar: considered, crafted, restrained. Deploys on
Vercel at `https://kennyvws.dev` with zero extra config.

## Stack

- Next.js (App Router, latest stable ≥ 14), TypeScript
- Tailwind CSS v4 — design tokens as CSS variables via `@theme` in `globals.css`
- `motion` (Framer Motion's current package) for animation
- `next-themes` for theming (class strategy, system default, persisted, no hydration flash)
- `react-icons` (Simple Icons set) for brand/tech iconography
- `next/font` for Geist Sans — no layout shift, no FOUT
- npm as package manager
- Location: `~/Projects/kennyvws.dev`, own git repo

## Visual system — "Quiet Precision"

Apple-HIG-inspired, the literal read. Deliberately the opposite of the discarded brutalist attempt
(`~/Desktop/Porto`): soft, refined, spacious.

**Type.** One family: Geist Sans. Hierarchy from size + weight only. Display headings large and
tightly tracked (`clamp()`-scaled, roughly 2.5rem → 5rem for the hero), body copy calm at
~1rem–1.125rem with relaxed leading. No mono, no serif.

**Color.** Neutral base + one accent, tokenized for both themes:

| Token         | Light                  | Dark                    |
|---------------|------------------------|-------------------------|
| surface       | near-white `#FAFAFA`   | near-black `#0A0A0A`    |
| surface-raised| white                  | `#161616`-ish           |
| text          | near-black `#111111`   | Apple `#F5F5F7`         |
| text-muted    | ~55% gray              | ~60% gray               |
| accent        | refined blue ~`#0066CC`| brighter blue ~`#409CFF`|

Exact values tuned during implementation; all text/accent pairs must pass WCAG AA contrast in both
themes. No neon, no second accent.

**Shape & depth.** Rounded corners 16–20px on cards, pill buttons. Soft low-spread shadows, subtle
1px borders on raised surfaces in dark mode. Frosted-glass sticky nav (`backdrop-blur` +
semi-opaque surface) whose border/backdrop fades in after scrolling begins.

**Spacing.** Generous `clamp()`-based section padding (~4rem mobile → ~9rem desktop), consistent
rhythm inside sections. Mobile-first: designed at 320–430px first, then widened.

## Architecture

```
src/
├── app/
│   ├── layout.tsx          fonts, metadata, ThemeProvider, skip-link
│   ├── page.tsx            composes the seven sections
│   ├── globals.css         Tailwind v4 @theme tokens, base styles
│   ├── opengraph-image.tsx generated OG card (name + role, both-theme-safe)
│   ├── robots.ts, sitemap.ts
├── components/
│   ├── nav/                Navbar, MobileMenu, ThemeToggle
│   ├── sections/           Hero, About, Skills, Projects, Writing, Contact, Footer
│   └── ui/                 Section, Reveal (scroll-reveal primitive), Button, Card, Tag
├── data/                   site.ts, nav.ts, skills.ts, projects.ts, posts.ts
├── hooks/                  useActiveSection.ts (IntersectionObserver scroll-spy)
└── lib/                    utils.ts (cn helper)
```

One component per section; all copy lives in `src/data/` so content edits never touch layout code.
The data-layer *pattern* (typed interfaces + content arrays) is ported from the old
`~/Desktop/Porto` attempt; its visual design is not reused in any form.

## Data layer

Content is taken verbatim from the brief. Notable requirements:

- **projects.ts** — five projects with `category` (`Computer Vision` | `LLM / Agents` |
  `ML Systems`), `year`, `status`, `featured` flag (PPE Detection, Bandar Tracker), `tags`, links.
  Each GitHub link gets its own placeholder slug, one per project, each marked
  `TODO(Kenny): confirm exact repo name`:
  `KennyUMN/ppe-detection`, `KennyUMN/bandar-tracker`, `KennyUMN/rag-eval-harness`,
  `KennyUMN/tiny-transformer`, `KennyUMN/doc-qa-agent`. PPE paper link stays `#` with
  `TODO(Kenny)` until a real link exists. No project points at the bare profile URL.
- **posts.ts** — four writing entries as given (titles, tags, dates, read times, excerpts),
  `href: "#"`, rendered as drafts.
- **site.ts** — name, role, pitch, status block (Focus / Now / Base / Status), email
  `hi@kennyvws.dev`, GitHub `https://github.com/KennyUMN`, LinkedIn
  `https://linkedin.com/in/kenny` (`TODO(Kenny): verify LinkedIn URL — slug "kenny" is likely
  someone else's`), X `https://x.com/kennyvws`, resume path `/resume.pdf`.
- **skills.ts** — four groups (Languages, ML / Deep Learning, LLM / Applied AI, Infra / MLOps)
  with react-icons icon keys.
- **nav.ts** — About, Stack, Work, Writing, Contact + Resume entry.

## Sections

1. **Nav** — sticky, frosted glass. Wordmark "Kenny", anchor links with active-section
   highlighting (scroll-spy), quiet "Resume" link → `/resume.pdf`
   (`TODO(Kenny): add resume.pdf to public/`), theme toggle. Mobile: hamburger → animated sheet
   menu (focus-trapped, Escape/route-anchor closes).
2. **Hero** — status pill ("Open to AI Engineer roles", soft dot), small name/role line, display
   headline built from the one-line pitch, sub-copy, CTAs: filled "See projects" (→ #work) and
   quiet "GitHub ↗". Status row: Focus / Now / Base / Status as a subtle 2×2 (mobile) / inline
   (desktop) block.
3. **About** — the three paragraphs from the brief (light flow edits only), then three fact
   cards: Training, Shipping, Writing.
4. **Skills / Stack** — four category cards, each a titled group of icon chips.
5. **Projects / Work** — filter pills: All / Computer Vision / LLM & Agents / ML Systems, animated
   re-layout on filter. Featured two render larger (asymmetric grid). Card content: title,
   year · status line, blurb, narrative description (problem → approach → outcome shaping of the
   given descriptions; no new facts), tags, GitHub/paper links.
6. **Writing** — section-level "Drafts — coming soon" label; four entries as list rows (title,
   tag, date, read time, excerpt) with a small "Draft" badge, not linked anywhere real.
7. **Contact** — heading, one-line framing (open to AI Engineer roles, internships, research
   collaborations), primary mailto button, GitHub / LinkedIn / X links.
8. **Footer** — minimal: name, year, small nav echo.

## Motion

- Scroll reveals via a `Reveal` primitive: opacity 0→1 + 12–16px y-translate, once per element,
  ~0.6s, expo-out curve; staggered children in card grids.
- Hover: cards lift ~2px with shadow ease; buttons press to ~0.98 scale.
- Filter changes: `AnimatePresence` + layout animations.
- Nav backdrop/border fades in after scroll starts.
- Global `MotionConfig reducedMotion="user"` — `prefers-reduced-motion` users get opacity-only.
- Compositor-friendly properties only (transform/opacity).

## Theming

`next-themes`, `attribute="class"`, `defaultTheme="system"`, `enableSystem`, persisted choice,
inline pre-hydration script (built into next-themes) so there is no flash of the wrong theme.
Toggle in nav switches light/dark; both themes are first-class.

## SEO & metadata

- `metadataBase: https://kennyvws.dev`, title "Kenny — AI Engineer", description from the pitch.
- OpenGraph + Twitter card metadata; generated `opengraph-image.tsx`.
- `robots.ts` + `sitemap.ts`.
- Semantic landmarks (`header/nav/main/section/footer`), `aria-labelledby` per section.

## Accessibility

- Skip-to-content link, visible focus rings (accent-colored), full keyboard operability including
  mobile menu and filter pills (`aria-pressed`), `aria-current` on active nav item.
- AA contrast in both themes; reduced-motion honored.

## Verification

- `next build` clean, `tsc --noEmit` clean, ESLint clean.
- Playwright smoke tests: hero renders, nav anchors navigate, theme toggle persists across reload,
  project filters actually filter.
- Playwright screenshots at 320 / 768 / 1024 / 1440 in light and dark, reviewed visually before
  calling the work done.

## Out of scope

- Real blog posts / CMS (Writing is placeholder by design).
- Real resume PDF (Kenny drops it into `public/resume.pdf`).
- Custom analytics, contact forms, i18n.

## Open TODOs left for Kenny (wired as placeholders, marked in code)

1. `public/resume.pdf` — add real file.
2. Five GitHub repo slugs — confirm exact names.
3. PPE paper link — replace `#` when available.
4. LinkedIn URL — verify `linkedin.com/in/kenny` is actually his.
