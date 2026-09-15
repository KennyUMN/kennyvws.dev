# Improvements — Deepening "Quiet Precision"

Bounded research loop output for `~/Projects/kennyvws.dev`. Goal: deepen the
approved Quiet Precision direction (Apple-HIG calm, restraint, refinement) — not
reinvent it. Write-only; no source touched.

**Ranked table** (updated each pass; Rank by impact-vs-effort).

| Rank | Idea | Applies | Effort | Why |
|------|------|---------|--------|-----|
| 1 | `text-wrap: balance` on display headings | Hero, Section, Contact | S | Kills ragged last lines; headline shape reads intentional |
| 2 | `text-wrap: pretty` on body paragraphs | About, Projects, Writing | S | Removes orphans/widows; calmer paragraph rhythm |
| 3 | Constrain reading measure to ~66ch | About, Contact | S | Falls inside 45–75ch comfort range; less eye travel |
| 4 | Derive `--edge` from surface via `color-mix` | global tokens | S | Borders auto-adapt both themes; kills token drift |
| 5 | Lit 1px inset top-edge on scrolled nav (dark) | Nav | S | Apple "premium edge" — depth without glow |
| 6 | Soft drop shadow under scrolled nav | Nav | S | Separates frosted bar from content quietly |
| 7 | Coordinated arrow nudge with link-draw | Hero, Projects, Contact, Footer | S | Arrow drifts in sync with underline — quiet, considered |
| 8 | Soft focus halo (box-shadow ring) for keyboard | global a/button | S | Calmer than bare outline, still clearly visible |
| 9 | `aria-label` on external links ("opens new tab") | Contact, Hero, Footer | S | SR users told the context before the jump |
| 10 | 44px min hit-area on desktop nav links | Nav | S | Meets WCAG 2.5.8 target size; calmer to hit |
| 11 | APCA check alongside WCAG AA in dark | global theme | S | Catches gray-on-black pairs AA wrongly passes |
| 12 | Muted `ink-muted` lift in dark mode | global | S | Dark AA can pass unreadable grays; nudge lighter |
| 13 | Dark `--edge` as translucent light hairline | global (dark) | S | Apple dark separator; reads as light catching an edge |
| 14 | Dark base off pure black (`#0d0d0f`) | global (dark) | S | Reduces contrast halos; considered material, not a void |
| 15 | Tint/soften dark-mode themed shadows | global (dark) | S | Pure-black shadows look muddy; precise floating layers |
| 16 | `color-scheme` for native scrollbar/controls | global | S | No light scrollbar flash on dark page; invisible craft |
| 17 | `metadata.robots` + `alternates.canonical` | layout/global | S | Explicit crawl + canonical intent; clean, invisible |
| 18 | `og:image:alt` + Twitter `images` array | layout/global | S | Robust, accessible share card (currently fragile) |
| 19 | `sitemap.ts` add `lastModified` | sitemap | S | Crawlers re-check at right cadence; correctness |
| 20 | Nav "Resume" as quiet ghost link | Nav | S | Keeps primary spine clean; less noise = more quiet |
| 21 | Echo "Now" status into About | About | S | Closes who-I-am → what-I'm-doing narrative loop |
| 22 | Writing "Draft" as consistent quiet badge | Writing | S | Signals placeholder intent uniformly, not accidental |
| 23 | Hero status block (Focus/Now/Base/Status) | Hero | M | Approved spec calls for it; currently missing — adds quiet composition |
| 24 | `text-box-trim: both` on display type | Hero, Section | M | Trims built-in leading so headings align — literal precision |
| 25 | Graduated type scale (add 1–2 intermediate steps) | Skills, About, Projects | M | Hierarchy reads as a ramp, not a binary jump |
| 26 | `title.template` branded suffix | layout/global | S | Future-proofs sub-route titles; discipline not decoration |
| 27 | Focus-visible ring on TermPreview trigger | TermPreview | S | Keyboard users see the glossary term is focusable |
| 28 | Verify skip-link lands on `<main id="main">` | layout/global | S | Skip link only useful if target exists & focuses |
| 29 | Tighter, single soft shadow on TermPreview card | TermPreview | S | Refine floating-card depth to feel intentional |
| 30 | `shadow-lifted` on open mobile sheet | Nav (mobile) | S | Sheet reads as a layer, not flat paint |
| 31 | Hairline vertical rule between About columns | About | S | Articulates the 3fr/2fr split without boxes |
| 32 | Subtle tonal band behind featured projects | Projects | M | Depth via tone, not a louder accent — stays quiet |
| 33 | Contrast floor token validated by APCA Lc | global tokens | M | Makes "AA in both themes" a measured rule, not a hope |
| 34 | Faded hairline dividers (mask gradient) | Projects, Writing | M | Softer separation than hard `border-y` |
| 35 | Whisper `surface-muted` fill on fact/skill cards | About, Skills | M | Layered depth via tone step, not shadow |
| 36 | Stagger container instead of manual `i*0.05` | Reveal, grids | M | Group eased reveal feels composed, not mechanical |
| 37 | Reveal distance varies by element role | Reveal | M | Headings settle small, lists travel more — motion hierarchy |
| 38 | Section lede under each `h2` (standfirst) | Sections | M | Editorial calm; states intent before the list |
| 39 | Consistent section eyebrows (01 — About) | Sections | M | Composed sequential rhythm via type, not color |
| 40 | Quiet running index on Writing rows (01–04) | Writing | M | Editorial calm; signals order without decoration |
| 41 | `forced-colors` fallbacks for hairlines/shadows | global | M | High-contrast/Windows users keep structure, not flat |
| 42 | Dark elevation ramp audit (lightness steps) | global (dark) | M | Dark elevation via lighter surfaces, not shadows |
| 43 | Reduced nav elevation in dark (material not shadow) | Nav (dark) | S | Lit edge does the work; matches Apple dark-nav |
| 44 | Selection/focus accent verified per theme | global | S | Keep one-accent system honest in both themes |
| 45 | JSON-LD `Person` structured data | layout/global | M | Machine-readable identity card; findable, invisible |
| 46 | Lead with outcome-first project line | Projects | S | Scan payoff upfront; respects problem→outcome order |
| 47 | Progressive-enhancement reveal (show by default) | Reveal, Hero | M | No-JS / slow-JS still shows content — protects LCP & a11y |
| 48 | `content-visibility: auto` on below-fold sections | Sections | M | Skips offscreen render work; needs intrinsic size care |
| 49 | Projects: filter pills + asymmetric featured grid | Projects | L | Fulfills approved spec's intended hierarchy (currently a flat list) |
| 50 | Deliberately skip web app manifest | global | S | Avoids PWA install chrome that fights the calm (non-action) |

---

## Pass 1 — Typography & rhythm

### 1. `text-wrap: balance` on display headings
- **Why it fits Quiet Precision:** display headings (Hero `h1`, each `Section` `h2`,
  Contact closing line) currently use `text-balance` already on the Hero `h1` and
  Contact line, but the `Section` `h2` and several headings do not. Balanced line
  breaks make the headline shape feel composed rather than accidentally ragged.
- **Where:** Hero `h1` (already has it — verify), `Section.tsx` `h2`, Contact closing
  `p`. Add `text-wrap: balance` to the ones missing it.
- **Effort:** S
- **Note:** `text-wrap: balance` is the modern standard for short headings (mdn).
  Keep `text-balance` utility where present or standardize on `text-wrap: balance`.

### 2. `text-wrap: pretty` on body paragraphs
- **Why it fits Quiet Precision:** prevents single-word orphan lines at the end of
  paragraphs (About, Projects description, Writing excerpt). Quiet = no awkward
  ragged tails.
- **Where:** About paragraphs, Projects `description`, Writing `excerpt`, Contact
  framing.
- **Effort:** S
- **Source:** `text-wrap: pretty` is purpose-built to avoid orphan/widow lines in
  running text (mdn web docs).

### 3. Constrain reading measure to ~66ch
- **Why it fits Quiet Precision:** the About left column is `text-lg` in a `3fr`
  track with no ch cap; on wide screens lines can exceed the 75ch comfort max,
  breaking reading rhythm. Capping at ~66ch (Bringhurst's optimum) keeps the eye
  relaxed — core to "calm".
- **Where:** About left column, Contact `max-w-2xl` prose, Projects `max-w-2xl`
  blurbs.
- **Effort:** S
- **Source:** optimal measure 45–75ch, sweet spot ~66ch (NN/g, Bringhurst via
  betterwebtype.com, practice.typekit.com).

### 4. `text-box-trim: both` (+ `text-box-edge: cap`) on display type
- **Why it fits Quiet Precision:** Geist's line-height adds invisible leading above
  and below caps. Trimming it lets the Hero headline and Section titles sit flush
  to their container edges — the "precision" half of the name, literally.
- **Where:** Hero `h1`, `Section` `h2`, Contact closing line. Best applied to the
  largest type where alignment matters.
- **Effort:** M (progressive enhancement; Safari/Chrome ship it, Firefox lags — wrap
  in `@supports` so no regression).
- **Source:** `text-box-trim` / `text-box-edge` in CSS Inline Level 3 (mdn,
  caniuse).

### 5. Graduated type scale (add intermediate steps)
- **Why it fits Quiet Precision:** current hierarchy jumps from 15px labels straight
  to 3xl/4xl headings. Adding a 1.25rem (text-xl) step for fact-card titles
  (`About`), skill-group titles, and project blurbs makes the ramp feel considered
  rather than binary — more "quiet" hierarchy.
- **Where:** About fact titles, Skills category titles, Projects `blurb`.
- **Effort:** M (token + component tweaks)

---

## Pass 2 — Color & contrast

### 6. APCA audit alongside WCAG AA in dark mode
- **Why it fits Quiet Precision:** the direction mandates AA in *both* themes, but
  WCAG 2.x's single 4.5:1 ratio can pass gray-on-near-black pairs that are actually
  hard to read (and the dark `--ink-muted: #a3a3ad` on `#0a0a0b` is exactly this
  risk class). APCA is polarity-aware and flags it. Keeps the calm readable.
- **Where:** global theme tokens, especially the dark `--ink-muted` and `--edge`.
- **Effort:** S (audit step; no code unless a pair fails)
- **Source:** APCA developed to correct WCAG 2.x dark-mode failures; polarity-aware
  Lc thresholds (apcacontrast.com; WCAG 3.0 editor's draft adopts it).

### 7. Lift `--ink-muted` in dark mode to a perceptual floor
- **Why it fits Quiet Precision:** if the APCA audit shows `#a3a3ad` is marginal,
  nudge it lighter (e.g. `#b8b8c0`) so muted text stays quiet-but-legible. Calm must
  not mean illegible.
- **Where:** `.dark` `--ink-muted`.
- **Effort:** S
- **Reject-check:** no second hue introduced — stays neutral gray, only lighter.

### 8. Derive `--edge` from surface via `color-mix`
- **Why it fits Quiet Precision:** currently `--edge` is hardcoded per theme
  (`#e4e4e8` light, `#26262b` dark). Deriving it as
  `color-mix(in srgb, var(--ink) 8%, transparent)` (or similar) makes hairlines
  track the surface automatically — one source of truth, no drift between themes.
  Systematic tokens = precision.
- **Where:** `globals.css` `:root` / `.dark` token block.
- **Effort:** S
- **Note:** `color-mix` is already used elsewhere in the file (`.link-rest`), so the
  technique is consistent with the existing codebase.

### 9. Subtle tonal band behind featured projects
- **Why it fits Quiet Precision:** the spec calls featured projects "larger
  (asymmetric grid)" but the current `Projects.tsx` renders a flat divided list with
  no featured emphasis at all. A whisper-quiet `bg-surface-muted` band (or 1px extra
  inset) behind the two featured rows signals hierarchy through *tone*, not a louder
  accent or shadow — exactly the restraint the direction wants.
- **Where:** `Projects.tsx` featured `li` rows.
- **Effort:** M (layout change to the list → could become a 2-col featured block)
- **Reject-check:** tone only, no accent color, no glow.

### 10. Contrast floor token validated by APCA Lc
- **Why it fits Quiet Precision:** turn "must pass AA in both themes" from a
  hope into a measured rule by recording the target APCA Lc per text tier
  (body ≥ Lc 60, muted ≥ Lc 45) next to each token. Makes the calm deliberate.
- **Where:** `globals.css` comment block / design-token doc.
- **Effort:** M (documentation + verification)
- **Reject-check:** none — pure discipline.

---

## Pass 3 — Depth & layering

### 11. Lit 1px inset top-edge on scrolled nav (dark mode)
- **Why it fits Quiet Precision:** Apple's frosted bars use a faint top inner
  highlight so the glass reads as a physical layer catching light. Adding
  `box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05)` (dark only, when `glass` is
  true) deepens the nav's material feel without any glow or second color.
- **Where:** `Navbar.tsx` glass state, `.dark` only.
- **Effort:** S
- **Reject-check:** no glow, no accent — a neutral light hairline only.

### 12. Soft drop shadow under the scrolled nav
- **Why it fits Quiet Precision:** once the border/backdrop fades in, a barely-there
  `shadow-soft` beneath the bar separates it from scrolling content. Right now the
  scrolled state has `border-edge/70` but no shadow, so on light surfaces the bar can
  feel pasted-on. A soft shadow makes it a layer.
- **Where:** `Navbar.tsx` glass `div`.
- **Effort:** S

### 13. `shadow-lifted` on the open mobile sheet
- **Why it fits Quiet Precision:** the mobile menu (`AnimatePresence` sheet) uses
  `bg-surface/95 backdrop-blur-xl` with a `border-b` but no depth. Adding
  `shadow-lifted` when `open` makes the sheet feel like it floats above the page —
  consistent with the desktop bar's layered language.
- **Where:** `Navbar.tsx` mobile-menu `motion.div`.
- **Effort:** S

### 14. Faded hairline dividers via mask gradient
- **Why it fits Quiet Precision:** `Projects.tsx` and `Writing.tsx` use hard
  `border-y border-edge` + `divide-y`. A "fade rule" — apply a horizontal
  `mask-image: linear-gradient(...)` to the divider line so it dissolves at the
  edges — is a quieter, more crafted separation than a full-width hard rule. Calmer.
- **Where:** `Projects.tsx` list, `Writing.tsx` list.
- **Effort:** M (pseudo-element or wrapper with mask)
- **Reject-check:** still a single neutral hairline, just softened.

### 15. Whisper `surface-muted` fill on fact/skill cards
- **Why it fits Quiet Precision:** About fact cards and Skills groups currently use
  only a `border-t`. Giving them a faint `bg-surface-muted` fill (or a thin inset
  card) introduces a *tone step* between surface and raised — layered depth through
  the existing neutral palette, no new color. Ties to the spec's surface/raised
  distinction.
- **Where:** `About.tsx` fact blocks, `Skills.tsx` group blocks.
- **Effort:** M
- **Reject-check:** uses existing `--surface-muted` token, neutral only.

### 16. Tighter, single soft shadow on the TermPreview card
- **Why it fits Quiet Precision:** the glossary popover (`TermPreview.tsx`) uses
  `shadow-soft` (two-layer). For a small floating card, a single, tighter soft shadow
  reads more precise and less "lifted." Refine to one low-spread shadow so the card
  feels intentional, not heavy.
- **Where:** `TermPreview.tsx` card `className`.
- **Effort:** S

---

## Pass 4 — Motion & micro-interaction

### 17. Coordinated arrow nudge with the link-draw underline
- **Why it fits Quiet Precision:** hero CTAs, project links, footer "Back to top"
  pair a `link-draw` underline with a static arrow glyph (→ ↗ ↑). Animating the arrow
  `translate-x` by 2–3px in sync with the underline drawing (same 200ms expo curve)
  makes the affordance feel *considered* rather than two disconnected effects. No new
  color, no scale jump.
- **Where:** Hero CTAs, `Projects.tsx` GitHub/Paper links, `Contact.tsx` socials,
  `Footer.tsx` back-to-top.
- **Effort:** S

### 18. Soft focus halo (box-shadow ring) for keyboard users
- **Why it fits Quiet Precision:** `:focus-visible` currently uses a 2px accent
  outline. Adding a faint `box-shadow: 0 0 0 4px color-mix(accent 25%, transparent)`
  behind it gives keyboard users a soft, premium halo — more visible on busy
  backgrounds, still calm (no hard double ring). This is the Apple/HIG focus language.
- **Where:** global `:focus-visible` in `globals.css`.
- **Effort:** S

### 19. Stagger container instead of manual `i * 0.05`
- **Why it fits Quiet Precision:** `Reveal` is currently applied per-item with a
  hand-computed `delay={i * 0.05}`. A parent `staggerChildren` container (the Hero
  already does this) gives an eased, grouped reveal that reads as one composed gesture
  rather than a mechanical count-up. More refined rhythm.
- **Where:** `Reveal.tsx` (add an optional stagger wrapper) + `Projects`/`Writing`/
  `Skills`/`About` grids.
- **Effort:** M

### 20. Reveal distance varies by element role
- **Why it fits Quiet Precision:** every `Reveal` travels `y: 16` identically. Giving
  display headings a smaller settle (y: 8) and list rows a slightly larger travel
  (y: 20) creates *motion hierarchy* that mirrors the visual hierarchy — quiet, but it
  makes the page feel art-directed.
- **Where:** `Reveal.tsx` (variant by `role` prop).
- **Effort:** M

---

## Pass 5 — Layout & composition

> Note: reviewing the current build against the approved spec surfaced two
> spec-gaps. The spec describes (a) Projects filter pills + an asymmetric featured
> grid and (b) a Hero status block (Focus / Now / Base / Status). The current
> `Projects.tsx` is a flat divided list and `Hero.tsx` has neither the status block
> nor filters. Closing these gaps *deepens* Quiet Precision by realizing the intended
> hierarchy — they are not new inventions.

### 21. Projects: filter pills + asymmetric featured grid
- **Why it fits Quiet Precision:** the spec's filter interaction (All / Computer
  Vision / LLM & Agents / ML Systems, `aria-pressed`, `AnimatePresence` re-layout)
  and the two `featured` projects rendering larger create intentional hierarchy
  through *scale and grouping*, not color. The current flat list loses that. Building
  it per-spec is the single biggest composition upgrade available.
- **Where:** `Projects.tsx` (replace the `<ul>` with a filter bar + grid; `projects.ts`
  already carries `category`, `featured`, `status`).
- **Effort:** L (new component logic, but data + spec already exist)
- **Reject-check:** filters use neutral pills + accent only on active; no second hue.

### 22. Hero status block (Focus / Now / Base / Status)
- **Why it fits Quiet Precision:** the spec's subtle 2×2 (mobile) / inline (desktop)
  status row is a signature calm-composition element — small, even, muted. Its
  absence leaves the hero feeling thin. Adding it per-spec grounds the hero.
- **Where:** `Hero.tsx`, below the CTAs; data already in `site.ts` status block.
- **Effort:** M

### 23. Hairline vertical rule between About columns
- **Why it fits Quiet Precision:** the `lg:grid-cols-[3fr_2fr]` split has no visible
  articulation. A single 1px `border-l border-edge` on the facts column (lg only)
  quietly signals the two-register composition without boxing anything. Ties to the
  hairline language used everywhere else.
- **Where:** `About.tsx` facts column, `lg:` breakpoint.
- **Effort:** S

### 24. Quiet running index on Writing rows
- **Why it fits Quiet Precision:** Writing is four draft rows. A muted `01–04` index
  in `ink-muted` (tabular, small) adds editorial calm and implied order with zero
  decoration — fits the "notes in draft" tone. No icons, no color.
- **Where:** `Writing.tsx` each `li`, left-aligned index.
- **Effort:** M

---

## Pass 6 — Accessibility & inclusion

### 25. `forced-colors` fallbacks for hairlines and shadows
- **Why it fits Quiet Precision:** the whole design leans on 1px `--edge` hairlines
  and soft shadows for structure. Under Windows High Contrast / `forced-colors: active`,
  shadows and translucent fills are stripped, which can flatten the page into
  indistinguishable blocks. Adding `@media (forced-colors: active)` rules that promote
  hairlines to `border` and keep section boundaries visible preserves the calm
  structure for those users. Inclusive *and* on-brand.
- **Where:** `globals.css` (new media block), plus key components.
- **Effort:** M

### 26. 44px minimum hit-area on desktop nav links
- **Why it fits Quiet Precision:** desktop nav anchors are `px-3 py-1.5` text-sm —
  their effective height can fall under the WCAG 2.5.8 44×44 target size. Bumping to
  `min-h-11` (already used on CTAs) makes them comfortable to hit without changing
  their visual size much. Calmer, more forgiving.
- **Where:** `Navbar.tsx` desktop link `a` elements.
- **Effort:** S

### 27. Focus-visible ring on the TermPreview trigger
- **Why it fits Quiet Precision:** `term-trigger` is `tabIndex={0}` and
  `aria-describedby`, so it's keyboard-focusable, but it only shows a dotted underline
  at rest — no distinct focus ring. Adding `:focus-visible { outline: 2px solid
  var(--accent); outline-offset: 2px }` (matching the global ring) makes keyboard
  focus unambiguous. The existing global `:focus-visible` may already catch it; verify
  and ensure it isn't overridden by the `term-trigger` text-decoration.
- **Where:** `TermPreview.tsx` / `globals.css`.
- **Effort:** S

### 28. `aria-label` on external links
- **Why it fits Quiet Precision:** GitHub / X / LinkedIn / Paper links open
  `target="_blank"` with `rel="noreferrer"` but no cue for screen-reader users that
  they'll leave the site. Adding `aria-label="GitHub (opens in a new tab)"` (etc.)
  states the context up front. Quiet, correct, no visual change.
- **Where:** `Contact.tsx` socials, `Hero.tsx` GitHub, `Projects.tsx` links.
- **Effort:** S

### 29. Verify the skip-link target exists and receives focus
- **Why it fits Quiet Precision:** the spec mandates a skip-to-content link, but it
  only helps if `<main>` carries `id="main"` (or the link's href matches the real id)
  and focus moves there. Confirm `layout.tsx` wraps sections in `<main id="main">` and
  the skip link points at it; otherwise the feature is decorative.
- **Where:** `layout.tsx`, skip-link markup.
- **Effort:** S (verification + one-line fix if missing)

*Already strong (verified, not new):* mobile-menu focus trap + Escape handling
(`Navbar.tsx`), `aria-current` on active nav, `MotionConfig reducedMotion="user"`
plus the `prefers-reduced-motion` CSS override for `[data-reveal]`, and
`aria-describedby` on `TermPreview`. These are exemplars to preserve.

---

## Pass 7 — Performance & Core Web Vitals

> Context: the site is text + inline SVG (react-icons) + CSS only — no `<img>`, no
> hero photo. LCP is the Hero `h1` (text), so font and JS resilience dominate CWV,
> not image loading.

### 30. Progressive-enhancement reveal (content visible by default)
- **Why it fits Quiet Precision:** every `Reveal` and the Hero set `initial` opacity
  0 in markup. If JS is disabled or hydration is slow, the LCP text and all section
  content can stay invisible — a hard LCP and accessibility failure. The fix: render
  content at `opacity: 1` by default and let a mounted client component add the
  `data-reveal` hidden state *after* hydration (the "hidden-until-JS" pattern, or a
  `.js` class on `<html>`). Quiet Precision must never depend on JS to be readable.
- **Where:** `Reveal.tsx`, `Hero.tsx` (and the reduced-motion CSS already guards
  `[data-reveal]` — extend the same idea to no-JS).
- **Effort:** M
- **Source:** progressive-enhancement reveal pattern (content-visible default, JS
  opt-in to animation) — common Core Web Vitals guidance.

### 31. `content-visibility: auto` on below-the-fold sections
- **Why it fits Quiet Precision:** `About`/`Skills`/`Projects`/`Writing`/`Contact`
  sit below the fold. `content-visibility: auto` lets the browser skip their layout/
  paint until near-viewport, cutting initial render cost. Pair with
  `contain-intrinsic-size` so scrollbar height is stable (no CLS). Must be applied
  carefully so it doesn't fight `whileInView` reveals (which already use
  `viewport: { once: true }` and work off IntersectionObserver — content-visibility
  hidden elements still observe, but give them an intrinsic size to avoid jump).
- **Where:** `Section.tsx` wrapper, or a utility class.
- **Effort:** M
- **Reject-check:** no visual change when applied correctly; pure rendering perf.

*Already strong (verified, not new):* `next/font` Geist is self-hosted with
`font-display: swap` and automatic size-adjust fallback metrics (near-zero CLS from
font swap); the nav's `useScroll` only flips `scrolled` state at the 8px threshold
(no re-render storm); `MotionConfig reducedMotion="user"` keeps animation JS light
for reduced-motion users; Tailwind v4 purges unused CSS.

---

## Pass 8 — Content & information architecture

> Grounding: read every section + data file. Current IA is a clean
> About / Stack / Work / Writing / Contact spine (5 nav items, ≤6 = good per NN/g).
> Copy is verbatim from the brief and already reads calm. The deepening moves here are
> *editorial*: tighten the connective tissue between sections, make each section's
> opening line earn its place, and give the page a quiet "you are here" sense without
> adding chrome. No new sections, no louder label.

### 32. Section intro lede under each `h2` (one quiet sentence)
- **Why it fits Quiet Precision:** every `Section.tsx` `h2` drops straight into content
  with no framing line. A single muted `text-ink-muted` lede (one sentence, ~66ch) under
  each title gives the eye a rest and states the section's intent before the list —
  editorial calm, like a magazine standfirst. It deepens the "considered" read without
  any decoration.
- **Where:** `Section.tsx` (optional `lede` prop) used by About/Skills/Projects/Writing/Contact.
- **Effort:** M (copy per section lives in `src/data/`, so it stays data-driven).
- **Reject-check:** prose only, no icon, no accent — just a muted standfirst.

### 33. Consistent "section eyebrows" — small muted kicker above each `h2`
- **Why it fits Quiet Precision:** the Hero and Contact close use a soft dot + status, but
  sections don't share a quiet labeling rhythm. A tiny uppercase-tracked `ink-muted` eyebrow
  (e.g. "01 — About") above each `h2` gives the whole page a composed, sequential feel and
  reinforces hierarchy through *type*, not color or rules. Ties to the editorial index idea
  (#24) on Writing.
- **Where:** `Section.tsx` (optional `eyebrow` prop), all five sections.
- **Effort:** M (token + data).
- **Reject-check:** neutral `ink-muted` only, no second hue.

### 34. Lead with the outcome-first project line (invert the blurb order)
- **Why it fits Quiet Precision:** recruiters scan; the current `Projects.tsx` shows
  `blurb` then `description`. Reordering so the *outcome/result* sentence leads (or folding
  the result into the `blurb`) respects the "problem → approach → outcome" spec order while
  making the scan pass rewarding. Calmer for the reader because the payoff is upfront.
- **Where:** `projects.ts` (`description` already ends on outcome) — adjust `blurb` copy or
  render order in `Projects.tsx`.
- **Effort:** S (copy/edit + render tweak).

### 35. "Currently" status line echoed into About, not just Hero
- **Why it fits Quiet Precision:** `site.ts` carries a `status` block (Focus / Now / Base /
  Status) the Hero should show (#22). Echoing a single muted "Now: …" line at the end of the
  About paragraphs closes the narrative loop (who I am → what I'm doing) so the page reads as
  one arc, not disconnected blocks. Quiet connective tissue.
- **Where:** `About.tsx` end of left column; data already in `site.ts`.
- **Effort:** S.
- **Reject-check:** reuses existing status copy, no new invented facts.

### 36. Writing section "drafts" framing as a quiet badge, consistent with Contact
- **Why it fits Quiet Precision:** Writing is placeholder by design (spec: "Drafts — coming
  soon"). Right now each row just reads "Draft · tag · date" inline. Making the "Draft" token
  a small consistent pill/badge (matching the Hero status dot language) signals intent
  uniformly and keeps the section from feeling unfinished-accidental. Direction-consistent,
  not louder.
- **Where:** `Writing.tsx` row, `posts.ts` unchanged.
- **Effort:** S.

### 37. Nav "Resume" as a quiet ghost link, not a louder CTA
- **Why it fits Quiet Precision:** `nav.ts` lists Resume as a nav entry. If it renders like
  the other anchors it adds clutter to the calm bar. Treating Resume as a subtly separated
  ghost link (divider + `ink-muted`, `link-draw` only) keeps the primary spine (About/Stack/
  Work/Writing/Contact) clean and reserves emphasis for the content. Less noise = more quiet.
- **Where:** `Navbar.tsx` desktop + mobile; `nav.ts` already flags it.
- **Effort:** S.

---

## Pass 9 — SEO & metadata

> Grounding: the site already has strong SEO bones — `metadataBase`, title, description,
> OpenGraph + Twitter summary_large_image, `opengraph-image.tsx` (1200×630 PNG), `robots.ts`
> (allow all + sitemap), `sitemap.ts` (single URL), semantic landmarks, `aria-labelledby`.
> This pass only adds what is *genuinely missing* and direction-consistent. No keyword
> stuffing, no second accent, no markup bloat.

### 38. `alternates.canonical` + `metadata.robots` (index/follow, max-image-preview)
- **Why it fits Quiet Precision:** a single-page site benefits from an explicit canonical so
  scrapers don't treat query/utm variants as duplicates, and an explicit `robots` rule
  (e.g. `index, follow, max-image-preview:large`) states intent cleanly. Quiet, correct,
  invisible to users. `robots.ts` exists but the HTML `<meta name="robots">` is not emitted
  without this.
- **Where:** `layout.tsx` `metadata.robots` + `metadata.alternates = { canonical: site.url }`.
- **Effort:** S.

### 39. `title.template` for a branded suffix
- **Why it fits Quiet Precision:** currently the only title is the root "Kenny · AI Engineer".
  A `title.template = "%s · Kenny"` future-proofs any sub-route (Writing post pages later) so
  titles stay consistent and calm rather than defaulting to the raw route segment. Discipline,
  not decoration.
- **Where:** `layout.tsx` `metadata.title.template`.
- **Effort:** S.

### 40. JSON-LD `Person` structured data (script in layout)
- **Why it fits Quiet Precision:** adding a `<script type="application/ld+json">` with
  schema.org `Person` (name, jobTitle, url, email, sameAs for GitHub/LinkedIn/X) gives search
  engines a clean, machine-readable identity card — the quiet, correct way to be "findable"
  without any visible change. Reuses `site.ts` fields; no invented data.
- **Where:** `layout.tsx` (or a small `JsonLd` component) emitting `Person` from `site.ts`.
- **Effort:** M (build the object from existing data).

### 41. `og:image:alt` + Twitter `images` array on the metadata
- **Why it fits Quiet Precision:** `opengraph-image.tsx` sets `alt = "Kenny · AI Engineer"` but
  the `openGraph` block in `layout.tsx` does not reference `images`/`alt`, so the generated
  image's alt isn't surfaced, and the Twitter card has `summary_large_image` with no `images`
  entry (it relies on the auto-discovered OG image — fragile). Explicitly wiring
  `openGraph.images` + `twitter.images` (pointing at `/opengraph-image`) plus `alt` makes the
  share card robust and accessible.
- **Where:** `layout.tsx` `openGraph.images` / `twitter.images`.
- **Effort:** S.

### 42. `sitemap.ts` add `lastModified` + keep single URL honest
- **Why it fits Quiet Precision:** the sitemap currently omits `lastModified`. Adding the
  build/deploy date (or a `site.updated` field) is a low-cost correctness improvement that
  helps crawlers re-check at the right cadence. Single URL is correct for a one-page site —
  don't invent fake sub-pages.
- **Where:** `sitemap.ts` (add `lastModified`).
- **Effort:** S.

### 43. `lang` + per-page `description` discipline already set; add `app/manifest`? (note, low prio)
- **Why it fits Quiet Precision:** `<html lang="en">` is present (good). A web app manifest is
  optional for a portfolio and risks adding PWA chrome that fights the calm. **Recommendation:
  skip the manifest** — it's not missing-critical and could introduce an install prompt.
  Listed only to record the deliberate *non*-action.
- **Where:** n/a (documented decision).
- **Effort:** S (decision only).
- **Reject-check:** do NOT add a manifest — would add noise, off the calm direction.

---

## Pass 10 — Dark/light theme craft

> Grounding: `globals.css` already defines a token set for both themes, with neutral base +
> one accent, themed shadows, and `color-mix` used for link hairlines. The dark theme is
> *present* but slightly less considered than light: pure-ish `#0a0a0b` base, `--raised`
> `#151518` (good lightness step), but `--surface-muted` `#1e1e23` and `--edge` `#26262b`
> are close together, and shadows use flat black. Per Apple HIG, dark-mode elevation should
> come from *lightness steps*, and separators should be translucent light, not dark rules.
> This pass makes the dark theme feel first-class.

### 44. Dark base: lift off pure black to a desaturated near-black
- **Why it fits Quiet Precision:** Apple HIG recommends avoiding pure `#000` in dark mode —
  a desaturated near-black (`#0d0d0f`–`#101012`) reduces contrast halos and reads as a
  considered material rather than a void. The current `#0a0a0b` is already near; nudging it a
  hair lighter (and ensuring `--raised`/`--surface-muted` keep clear steps above it) makes the
  stack feel intentional. No new hue.
- **Where:** `.dark --surface` (and re-tune `--raised`/`--surface-muted` to preserve the step).
- **Effort:** S.

### 45. Elevation via lightness steps (audit the dark surface ramp)
- **Why it fits Quiet Precision:** in dark mode, elevation should be conveyed by surfaces
  getting *lighter* as they rise (Apple HIG), not by shadows. Verify the dark ramp
  `surface #0a0a0b → raised #151518 → surface-muted #1e1e23` has even, perceivable steps (and
  that cards/sheets use `--raised` while insets use `--surface-muted`). If two tokens collapse
  visually, bump the step. This is the literal craft of a good dark theme.
- **Where:** `.dark` token block; components already consume `--raised`/`--surface-muted`.
- **Effort:** M (perceptual audit + value tuning).

### 46. Themed separators: dark `--edge` as translucent light, not dark rule
- **Why it fits Quiet Precision:** Apple uses `~60% white` separators in dark mode. The current
  dark `--edge: #26262b` is a *dark* line on a dark base — low contrast, reads as a groove.
  Switching dark `--edge` to `color-mix(in srgb, #ffffff 12%, transparent)` (a faint light
  hairline) makes dividers feel like light catching an edge — consistent with the lit nav edge
  (#11) and far more "premium." Already partially aligned with the `color-mix` link language.
- **Where:** `.dark --edge` (derive via `color-mix`), or keep a static value tuned to ~12% white.
- **Effort:** S.

### 47. Themed shadows: tint dark shadows with a cool neutral, soften spread
- **Why it fits Quiet Precision:** dark-mode box-shadows using pure `rgb(0 0 0 / …)` can look
  muddy/heavy. Tinting the shadow slightly (e.g. `rgb(0 0 0 / …)` → a hair of the accent's
  complement, or simply lower opacity + tighter spread) and keeping `--shadow-soft` subtle
  makes floating layers (nav, TermPreview, mobile sheet) feel precise rather than dropped. The
  light theme already uses low-opacity neutral shadows — mirror that restraint in dark.
- **Where:** `.dark --shadow-soft` / `--shadow-lifted`.
- **Effort:** S.

### 48. `color-scheme` token for form-control / scrollbar native theming
- **Why it fits Quiet Precision:** adding `color-scheme: light` / `color-scheme: dark` (via
  `:root` and `.dark`, or `next-themes`) lets native UI — scrollbars, `::selection` fallback,
  form controls, the `mailto`/print dialog — follow the theme automatically instead of flashing
  a light scrollbar on a dark page. Invisible craft that removes a small "uncanny" seam.
- **Where:** `globals.css` `:root` / `.dark` (or set on `<html>` via ThemeProvider).
- **Effort:** S.

### 49. Selection + focus accent tuned per theme (already good — verify contrast)
- **Why it fits Quiet Precision:** `::selection` uses `var(--accent)` with `--accent-contrast`
  (white on light blue, near-black on bright blue) — already themed correctly. Verify the
  selected-text contrast holds in both themes (the bright dark-accent `#409cff` with near-black
  text may be marginal). If marginal, nudge `--accent-contrast` dark value lighter. Keeps the
  one-accent system honest in both themes.
- **Where:** `globals.css` `::selection` + `.dark --accent-contrast`.
- **Effort:** S.

### 50. Reduced "elevation" in dark for the frosted nav (material, not shadow)
- **Why it fits Quiet Precision:** the dark scrolled nav (#11 lit edge + #12 soft shadow) leans
  on a shadow for separation. In dark mode a shadow is nearly invisible — so the *lit 1px top
  edge* (#11) should do the heavy lifting, with the shadow kept whisper-faint. Refining the dark
  nav to read as a luminance step (slightly lighter bar than page) rather than a dropped shadow
  matches Apple's dark-nav material language and feels more intentional than the light theme's
  shadow approach.
- **Where:** `Navbar.tsx` glass state in `.dark` (pair with #11/#12 already proposed).
- **Effort:** S.

---

## Loop summary

- **Facets covered (all 10):** Typography & rhythm (1), Color & contrast (2), Depth &
  layering (3), Motion & micro-interaction (4), Layout & composition (5), Accessibility &
  inclusion (6), Performance & Core Web Vitals (7), Content & information architecture (8),
  SEO & metadata (9), Dark/light theme craft (10).
- **Total passes:** 10.
- **Total stalls:** 0.
- **Total ideas:** 50 (#1–#50), none duplicated across passes.
- **Quickest high-impact wins (S effort, broad calm payoff):**
  1. `text-wrap: balance` on `Section` h2 + `text-wrap: pretty` on paragraphs (#1, #2) — instant composed typography.
  2. Derive `--edge` via `color-mix` so hairlines adapt both themes (#4) — kills token drift.
  3. Lit inset top-edge + soft shadow on scrolled nav (#5, #6) — Apple "premium edge" depth.
  4. Coordinated arrow nudge with link-draw + soft focus halo (#7, #8) — considered micro-interaction, no color added.
  5. Dark `--edge` as translucent light hairline + dark base off pure black (#13, #14) — makes the dark theme feel first-class.
- **Note:** Pass 9 confirms the site's SEO bones are strong (sitemap/robots/OG/semantics
  already present); only genuinely missing, direction-consistent items were added (#17–#19,
  #26, #45), and one deliberate *non*-action (skip the web app manifest, #50) was recorded.
