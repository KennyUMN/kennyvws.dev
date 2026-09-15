# kennyvws.dev — Rauno-Pivot Improvement Research

Bounded research loop evaluating NAMED techniques for a philosophy-led, anti-template
redesign in the spirit of `docs/superpowers/specs/2026-07-13-rauno-philosophy-redesign-design.md`.
This build already implements most of that spec (sentence-hero, `.link-draw`, `TermPreview`,
de-boxing, one accent moment, POV closing). The loop looks for *further* sharpening that
expresses a point of view rather than a template.

**Grounding (read before writing):** the current tree already has `TermPreview.tsx`, the
`.link-draw`/`.link-rest`/`.term-trigger` utilities in `globals.css`, the de-boxed Projects
editorial list, the `Section`/`Reveal` primitives, the focus-trapped `Navbar`, scroll-spy
`useActiveSection`, and the one-accent `ButtonLink`. "Keep from current build?" notes below
assume those stay.

---

## Ranked table (impact vs effort)

Ranked highest-impact / lowest-effort first. Updated each pass.

| Rank | Idea | Applies | Effort | Keep from current build? | Why it fits the anti-template POV |
|---|---|---|---|---|---|
| 1 | Fluid modular scale for section headings | Hero · Sections | S | Hero `clamp()` + Geist family | Kills breakpoint step-jumps so the editorial voice stays continuous, not templated |
| 2 | `text-wrap: pretty` on body/lead copy | About · Projects · Contact | S | `text-balance` on hero + H2 | Removes orphan words — a quiet, considered detail templates skip |
| 3 | `font-variant-numeric: tabular-nums` for years/dates | Projects · Writing · About | S | nothing yet | Right-aligned `year · status` aligns like a real editorial index |
| 4 | Tracking ramp token (display tighter than body) | Hero · Sections | S | `tracking-tight` everywhere | Larger type tracked tighter reads as typographic confidence, not a default |
| 5 | Dedicated display treatment for POV closing | Contact/closing | S | `text-2xl/3xl` closing | Gives the manifesto its own voice — hierarchy through scale, not boxes |
| 6 | `--ink-muted` lifted to a tokenized AA floor | global theme | S | muted grays as-is | Monochrome system has less color to hide a miss behind — lock the muted step to AA on body text |
| 7 | `oklch` token migration (no-hue-shift dark) | global theme | M | hex tokens as-is | Same perceptual lightness across themes keeps the "one voice" feel; dark mode stays a recolor, not a redesign |
| 8 | Accent reserved for signal only (audit) | global theme | S | lone accent CTA + focus + ::selection + status dot | The single-accent discipline IS the POV; a token-ule forbids accent leak into links/blurbs |
| 9 | `color-mix` tint ramp for hairlines/edges | global theme | S | `.link-rest`, `.term-trigger`, edges | One token drives resting underlines + edges so the monochrome stays cohesive, not 6 gray values |
| 10 | Sticky "context" column (About/Skills) | About · Skills | M | 2-col About grid, de-carded Skills | Depth via relationship + scroll, not boxed cards — editorial, not template |
| 11 | Section-anchored hairline + generous void | global / between sections | S | `divide-y` lists, `Section` padding | White space as the only "layer" — the de-boxed POV's version of depth |
| 12 | TermPreview cursor-z layering (extend) | Hero · About · Projects | S | `TermPreview` portal + spring track | The one allowed floating layer; reuse for any hover-capable term so depth is earned, not decorative |
| 13 | Frosted nav as the sole fixed depth plane | Nav | S | Navbar `backdrop-blur` glass | Keep the single fixed/blurred surface; everything else stays flat — one depth rule, applied once |
| 14 | `whileInView` + `viewport.once` cadence audit | global (Reveal) | S | `Reveal` primitive | Keeps reveals calm/once — the "considered" motion that separates craft from template bounce |
| 15 | Scroll-spy underline "held" vs "draw" parity | Nav | S | `link-active` + `link-draw` | Active state is a *held* underline, hover is a *drawn* one — two vocabularies, one cue system |
| 16 | Reduced-motion = opacity-only, global | global theme | S | `MotionConfig reducedMotion="user"` | Honors the calm; transforms disabled, underline toggles instantly — inclusion as default |
| 17 | TermPreview spring-lag as signature motion | Hero · About | S | `TermPreview` spring | The one obsessable micro-interaction; tune stiffness/damping so it feels *instant-but-alive* |
| 18 | Section-to-section scroll rhythm (no parallax) | global | S | `scroll-behavior: smooth` | Continuous-scroll POV: avoid parallax/gimmicks; let reveal stagger carry the pace |
| 19 | Off-center hero (left-anchored, wide measure) | Hero | S | `max-w-5xl` centered hero | Left-anchored headline + offset meta breaks the centered-hero template; editorial, not generic |
| 20 | Asymmetric 12-col for Projects/Writing lists | Projects · Writing | M | `divide-y` lists, `max-w-5xl` | Let title span wide, meta hang in a narrow right rail — a real editorial index, not a stacked list |
| 21 | Left-aligned consistent container (kill center) | global | S | `mx-auto max-w-5xl` | Keep one left text-edge across sections so the page reads as a document, not centered blocks |
| 22 | Hairline "rule of thirds" section intros | Sections | S | `Section` H2 | Place section title at a grid third, not flush-left default — quiet grid tension |
| 23 | TermPreview = WCAG 1.4.13 hover/focus parity | Hero · About | S | `TermPreview` a11y | Previews must appear on BOTH hover and focus, dismiss on Esc/blur — content-on-hover done right |
| 24 | Non-text contrast 1.4.11 on focus + dotted term | global | S | `:focus-visible` ring, `.term-trigger` | Focus ring + dotted term underline must hit 3:1 against surface — the monochrome makes this easy to miss |
| 25 | ≥44px tap targets on all text links | Hero · Contact · Footer · Nav | S | `min-h-11` on CTAs/socials | Coarse-pointer hit areas already on CTAs; verify nav + back-to-top + project links too |
| 26 | `prefers-reduced-motion` = instant underline | global | S | `MotionConfig` + CSS override | Already wired; audit that EVERY draw/term is instant under reduced motion, not just some |
| 27 | Visible `:focus-visible` color-independent cue | global | S | accent focus ring | Keep accent ring; ensure it's also distinguishable by *shape/offset*, not only color, for color-blind users |
| 28 | Zero-CLS term card (portal off-DOM) | Hero · About | S | `TermPreview` portal | Card renders in a portal, content stays in DOM — no shift on hover; current build already does this |
| 29 | `next/font` Geist = CLS-free + preload | global | S | Geist `variable` font | Already wired; keep `display:"swap"` + no FOUT/CLS — protects LCP on the sentence-hero |
| 30 | Passive scroll-spy (IntersectionObserver) | Nav · global | S | `useActiveSection` | Already IO-based, not scroll-handler churn — keep; IO is the INP-friendly choice |
| 31 | `content-visibility: auto` on below-fold sections | Sections | M | `Section` wrapper | Skip rendering work for offscreen sections; cheap INP/TBT win on a long single page |
| 32 | Avoid layout-shifting `Reveal` initial offset | global | S | `Reveal` `y:16` initial | SSR inlines `y:16`; reduced-motion zeroes it — keep, and ensure no width/height animating |
| 33 | Data-layer pattern (typed content arrays) | global | S | `src/data/*` interfaces | Copy lives in `data/`; layout never edits for content — the anti-template foundation, keep |
| 34 | Narrative arc: thesis → evidence → POV | global order | S | section order | Hero=sentence thesis, Projects+Writing=evidence, closing=manifesto — a document, not a menu |
| 35 | Hiring-manager scan value preserved | Projects · Skills | S | tag-as-text, `featured` scale | De-boxing kept the scan signals (tags, categories, featured) as text/scale — don't lose them |
| 36 | Single source of truth for nav/section ids | Nav · Sections | S | `nav.ts` + `sectionIds` | `navItems`/`sectionIds` drive both nav + scroll-spy — one map, no drift; keep |
| 37 | `terms.ts` as extensible preview registry | Hero · About | S | `TermPreview` + `terms.ts` | Adding a term = one data entry + one inline wrap (typed `TermId`); the signature stays cheap to grow |

---

## Per-idea detail

### T1 — Fluid modular scale for section headings
- **Why:** Replace the fixed `text-3xl sm:text-4xl` step in `Section.tsx` with a `clamp()`
  token (e.g. `clamp(1.75rem, 1.2rem + 1.6vw, 2.5rem)`) so section titles grow fluidly like
  the hero already does. Editorial sites (Utopia, A List Apart) treat type as one continuous
  system rather than breakpoint jumps.
- **Where:** `Section` H2 (`src/components/ui/Section.tsx`), optionally the closing line.
- **Effort:** S — token in `@theme`, one className swap.
- **Keep from current build?:** Hero `clamp(1.9rem,1rem+3vw,3.25rem)` and the single Geist
  family stay. This just extends the same idea downward.
- **Sources:** [Utopia fluid type](https://utopia.fyi), [A List Apart editorial type](https://alistapart.com), [CSS-Tricks clamp](https://css-tricks.com).

### T2 — `text-wrap: pretty` on body/lead copy
- **Why:** `text-wrap: pretty` prevents single-word orphans at paragraph ends — applied to
  About paragraphs, the project `description`/`blurb`, and the Contact framing line. The hero
  and H2s already use `text-balance`; this extends polish to the running text where templates
  leave ragged orphans.
- **Where:** `About.tsx` paragraphs, `Projects.tsx` blurb/description, `Contact.tsx` framing.
- **Effort:** S — a utility class / token.
- **Keep from current build?:** `text-balance` on hero + section titles stays; add `pretty`
  to body copy.
- **Sources:** [MDN text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap).

### T3 — `font-variant-numeric: tabular-nums` for years/dates
- **Why:** The Projects `year · status` line is right-aligned (`justify-between`); with
  proportional figures the years wobble. `tabular-nums` (or `font-feature-settings:"tnum"`)
  locks digit width so the small meta column reads like a real index. Also helps Writing
  `formatDate` and About dates.
- **Where:** `Projects.tsx` meta line, `Writing.tsx` date, any numeric meta.
- **Effort:** S — token, no markup change.
- **Keep from current build?:** The right-aligned meta layout stays; only the figure rendering
  changes.
- **Sources:** [Ahmad Shadeed numeric details](https://ishadeed.com).

### T4 — Tracking ramp token (display tighter than body)
- **Why:** Currently every heading uses `tracking-tight`. A deliberate ramp — tighter on
  display/hero, looser on small labels — is the kind of typographic character Rauno-style
  sites show. Confident large type wants negative tracking; tiny labels want neutral/positive.
- **Where:** Hero H1, Section H2, closing line (tighter) vs nav labels / status pill (neutral).
- **Effort:** S — add `--tracking-display` / `--tracking-tight` tokens.
- **Keep from current build?:** `tracking-tight` on hero stays; refine the ramp.
- **Sources:** [Richard Rutter web typography](https://webtypography.net).

### T5 — Dedicated display treatment for POV closing
- **Why:** The closing "Clean the data. Fight the training run. Ship the server." is the only
  net-new copy and the thesis of the page. Give it a distinct display size/leading from the
  section H2 (e.g. larger `clamp`, tighter leading, perhaps a hairline rule above it) so it
  lands as a manifesto, not just another heading. Hierarchy through scale contrast — a design
  quality bar.
- **Where:** `Contact.tsx` closing `Reveal`.
- **Effort:** S — tuning only; no new component.
- **Keep from current build?:** `contact.closing` data + its own `Reveal` stay; restyle size.
- **Sources:** design-quality bar #1 (scale-contrast hierarchy) from project rules.

### T6 — `--ink-muted` lifted to a tokenized AA floor
- **Why:** The Rauno spec's own verification step warns the page is "far more monochrome now,
  so there is less color left to hide a miss behind." Set `--ink-muted` to the minimum contrast
  that still passes AA (4.5:1) against `--surface` for *body* text, while allowing a slightly
  lighter muted step only for non-essential meta. Right now `--ink-muted` is `#5d5d66` on
  `#fafafa` (~6.4:1, fine) but `#a3a3ad` on `#0a0a0b` (~8:1, fine) — the discipline is to
  *freeze* these as named floors so future edits can't drift under AA.
- **Where:** `globals.css` `:root` and `.dark` token blocks.
- **Effort:** S — add a comment-documented floor + a separate `--ink-faint` for decorative meta.
- **Keep from current build?:** Existing hex values stay; add a token boundary + optional
  fainter step for truly decorative text (e.g. footer).
- **Sources:** [WebAIM contrast](https://webaim.org/articles/contrast), spec §Verification contrast re-check.

### T7 — `oklch` token migration (no-hue-shift dark)
- **Why:** Current tokens are authored in hex separately per theme, so light and dark can
  drift in perceived lightness. Authoring in `oklch` (e.g. `--ink: oklch(0.2 0 0)`) lets you
  hold *chroma* and *hue* constant and only swing lightness — the dark theme becomes a true
  recolor, preserving the "one voice, two exposures" feel that sells a monochrome POV. Tailwind
  v4 `@theme` accepts oklch directly.
- **Where:** `globals.css` `@theme` tokens.
- **Effort:** M — recompute all 7 tokens in oklch; verify AA after.
- **Keep from current build?:** The token *names* and the light/dark structure stay; only the
  color space changes. Keep `--accent` hue constant across themes (it already does).
- **Sources:** [web.dev oklch](https://web.dev/articles/oklch-in-css), [Tailwind v4 theme](https://tailwindcss.com/docs/theme).

### T8 — Accent reserved for signal only (token-rule audit)
- **Why:** The whole pivot's thesis is "colorless links + one accent moment." Add a lint-able
  convention: accent appears only in (a) the Contact `ButtonLink`, (b) focus rings,
  (c) `::selection`, (d) the status dot. Anything else using `text-accent`/`bg-accent` is a
  regression toward template-colored links. This is a *policy* idea as much as a visual one.
- **Where:** global convention; `globals.css` + review of `Projects.tsx`/`Contact.tsx`.
- **Effort:** S — grep audit + a comment in `globals.css`.
- **Keep from current build?:** The lone accent CTA, focus ring, `::selection`, status dot all
  stay exactly. This codifies what already exists.
- **Sources:** Rauno spec §2 (colorless links), §5 (one accent moment).

### T9 — `color-mix` tint ramp for hairlines/edges
- **Why:** The build already uses `color-mix(in srgb, currentColor 35%, transparent)` for
  `.link-rest` and `color-mix(... ink-muted 70% ...)` for `.term-trigger`. Promote this to a
  single `--edge-tint` token so every hairline (section `divide-edge`, card borders, resting
  underlines, dotted terms) draws from one cohesive mix. Cohesive atmosphere = one tint source,
  not six hand-picked grays.
- **Where:** `globals.css` — replace ad-hoc mixes with `--edge-tint` / `--underline-rest`.
- **Effort:** S — consolidate existing mixes into named tokens.
- **Keep from current build?:** `.link-rest` and `.term-trigger` behavior stays; source them
  from shared tokens.
- **Sources:** [MDN color-mix](https://developer.mozilla.org/en-US/docs/Web/CSS/color-mix).

### T10 — Sticky "context" column (About / Skills)
- **Why:** The About section already splits `3fr_2fr` with paragraphs left and fact blocks
  right. Make the right column `position: sticky; top: <nav height + gap>` so as the long left
  column scrolls, the facts/stack stay pinned as a quiet "context rail." This creates depth
  through *relationship and motion* (a layer that holds still while content moves) without any
  card chrome — the opposite of a template card grid. Editorial sites (e.g. Rauno, Every
  Layout's "sticky" patterns) use this constantly.
- **Where:** `About.tsx` right column, optionally `Skills.tsx` (stack as a sticky rail on wide
  screens).
- **Effort:** M — sticky wrapper + top offset tied to nav height; mobile stays stacked.
- **Keep from current build?:** The 2-col About grid and de-carded Skills `border-t` blocks
  stay; only the sticky behavior is added.
- **Sources:** [Every Layout (Pickering/Bell)](https://every-layout.dev), [Ahmad Shadeed sticky](https://ishadeed.com).

### T11 — Section-anchored hairline + generous void
- **Why:** Depth in a de-boxed system comes from *negative space and the occasional rule*, not
  elevation. Keep `Section` padding generous (`clamp(4rem…8.5rem)`) and let the only "edges"
  be the list rules (Projects/Writing `divide-y`) and the fact-block `border-t`. Audit that no
  stray `shadow`/`border` creeps back in. The void *is* the layering.
- **Where:** `Section.tsx` padding, `Projects.tsx`/`Writing.tsx` rules, `About.tsx`/`Skills.tsx`
  `border-t`.
- **Effort:** S — audit + keep; no new markup.
- **Keep from current build?:** Everything already there stays; this is a guardrail against
  re-boxing.
- **Sources:** design-quality bar #3 (depth via overlap/shadow/surface/motion) reinterpreted as
  void-based depth.

### T12 — TermPreview cursor-z layering (extend to Projects)
- **Why:** TermPreview is already a portal-rendered, spring-tracked floating card — the one
  sanctioned depth layer. The spec only wires 4 terms (hero + About). Consider adding 1–2
  hover-capable terms inside Projects blurbs (e.g. wrap a technique name) so the floating layer
  recurs as a *consistent interaction language* rather than a one-off hero trick. Depth is
  "earned" by hovering real content, never decorative.
- **Where:** `Projects.tsx` blurb (`TermPreview` wraps a term), `terms.ts` gains entries.
- **Effort:** S — data entry + one inline wrap; reuse existing component.
- **Keep from current build?:** `TermPreview.tsx` + `.term-trigger` + portal/spring logic stay
  untouched; only more usages.
- **Sources:** Rauno spec §3 (signature interaction as the site's point of view).

### T13 — Frosted nav as the sole fixed depth plane
- **Why:** The `Navbar` glass (`backdrop-blur-xl` + `bg-surface/75`, border fades in on scroll)
  is the only blurred/fixed surface on the page. That singularity is the point: one depth rule,
  applied once. Keep it; do NOT add frosting to the term card or any section. The term card
  stays `bg-raised` solid (already correct) so it reads as content, not chrome.
- **Where:** `Navbar.tsx` glass logic (keep), `TermPreview.tsx` (keep solid).
- **Effort:** S — a documented "only one blurred plane" rule.
- **Keep from current build?:** Navbar glass + scroll-triggered border stay exactly.
- **Sources:** Rauno spec §4 (deliberately still boxed: term card, nav sheet, toggle — nothing
  else).

### T14 — `whileInView` + `viewport.once` cadence audit
- **Why:** `Reveal` already uses `whileInView` with `once: true` and a 0.6s expo-out. Audit that
  every reveal stays `once` (re-animating on scroll-up reads as a template), and that stagger
  delays stay sub-0.1s so the page feels *considered*, not bouncy. This is the difference
  between craft and a default AOS-style fade-in library.
- **Where:** `Reveal.tsx` (keep), call sites in sections.
- **Effort:** S — review delays; tune `duration`/`delay` constants.
- **Keep from current build?:** `Reveal` primitive + `EASE_OUT` expo curve stay.
- **Sources:** [Framer Motion whileInView](https://www.framer.com/motion), [Josh Comeau reduced motion](https://www.joshwcomeau.com/animation/prefers-reduced-motion).

### T15 — Scroll-spy underline "held" vs "draw" parity
- **Why:** The spec's nav design is subtle and good: active item = underline *held* at
  `scaleX(1)` (`.link-active`), non-active hover = underline *drawn* in. Keep both, and make
  sure the *color/weight* shift on active is also present (currently `text-ink` vs
  `text-ink-muted`) so keyboard and mouse users get identical signal. This two-state vocabulary
  is a point-of-view detail templates don't bother with.
- **Where:** `Navbar.tsx` desktop items, `globals.css` `.link-active`/`.link-draw`.
- **Effort:** S — verify parity; no markup change likely needed.
- **Keep from current build?:** The held/draw split and `aria-current` wiring stay exactly.
- **Sources:** Rauno spec §2 (two distinct nav states sharing one underline vocabulary).

### T16 — Reduced-motion = opacity-only, global
- **Why:** Already wired: `MotionConfig reducedMotion="user"` plus a CSS override that kills
  `[data-reveal]` transform and makes `.link-draw` instant. Keep and *extend the audit* to
  TermPreview (it already drops spring + scale under reduced motion — good) and any future
  motion. Reduced motion isn't a fallback; it's the same calm, just without the travel.
- **Where:** `globals.css` reduced-motion block, `TermPreview.tsx`, `layout.tsx` MotionConfig.
- **Effort:** S — audit coverage; no new logic.
- **Keep from current build?:** All existing reduced-motion handling stays.
- **Sources:** [Josh Comeau reduced motion](https://www.joshwcomeau.com/animation/prefers-reduced-motion), project a11y rules.

### T17 — TermPreview spring-lag as signature motion
- **Why:** `TermPreview` uses `useSpring` (`stiffness:400, damping:40`) so the card trails the
  cursor with life. This is the *one* obsessable micro-interaction the whole pivot hangs on.
  Treat its feel as a tuning target: too stiff = dead, too loose = floaty. Document the chosen
  values as the signature. Keep it the only spring on the page.
- **Where:** `TermPreview.tsx` `SPRING` constant.
- **Effort:** S — tune one constant; already implemented.
- **Keep from current build?:** The portal + `useMotionValue`/`useSpring` + viewport-clamp
  logic stays; only feel is tuned.
- **Sources:** Rauno spec §3 (exactly ONE obsessed-over micro-interaction).

### T18 — Section-to-section scroll rhythm (no parallax)
- **Why:** The continuous-scroll POV (spec §4) means sections should *breathe into each other*.
  Keep `scroll-behavior: smooth` and the generous `Section` padding; explicitly avoid parallax,
  scroll-jacking, or sticky-section backgrounds (those reintroduce template gimmickry). Let the
  `Reveal` stagger alone carry the pace. Depth/tempo from content, not camera moves.
- **Where:** `globals.css` smooth scroll, `Section.tsx` padding.
- **Effort:** S — a documented "no parallax" rule.
- **Keep from current build?:** Smooth scroll + `Section` rhythm stay; no new motion.
- **Sources:** Rauno spec §4 (long continuous scroll, de-boxed sections).

### T19 — Off-center hero (left-anchored, wide measure)
- **Why:** The hero currently centers its content block (`mx-auto max-w-5xl`). Editorial
  composition breaks the centered-hero cliché by anchoring the headline to the *left text edge*
  and letting the long pitch run wide (the `max-w-4xl` already biases left via the container).
  A left-anchored hero with the status pill above it reads as a magazine opener, not a
  "centered headline + gradient blob + CTA" template (which the reject-list bans).
- **Where:** `Hero.tsx` — drop the centering, keep `max-w-4xl` left-aligned under the nav.
- **Effort:** S — remove `mx-auto`/centering on hero block; keep `text-balance`.
- **Keep from current build?:** The sentence-hero H1, status pill, `.link-rest` CTAs all stay;
  only alignment shifts.
- **Sources:** editorial grid-breaking synthesis (Swiss/International influence, off-center
  placement), reject-list (no centered-hero template).

### T20 — Asymmetric 12-col for Projects/Writing lists
- **Why:** Projects/Writing are `divide-y` lists inside `max-w-5xl`, with title + right-aligned
  meta on one `flex` row. Promote this to a true asymmetric grid: title/blurb span ~8 cols, the
  `year · status` / date meta hangs in a narrow right rail (~col 9–12), and tags sit under the
  blurb. This is how real editorial indexes compose — it adds hierarchy without a single card.
- **Where:** `Projects.tsx` entry grid, `Writing.tsx` entry grid.
- **Effort:** M — convert the `flex` rows to a `grid` with named column spans; mobile collapses
  to 1 col.
- **Keep from current build?:** The `divide-y border-y` list, `featured` scale bump, tag-as-text
  all stay; only the internal grid becomes asymmetric.
- **Sources:** editorial grid-breaking synthesis (intentional column breaks, scale contrast).

### T21 — Left-aligned consistent container (kill center)
- **Why:** Right now every section centers its `max-w-5xl` block, so headings and body share a
  centered axis. For a document-like POV, fix one *left text edge* across all sections (same
  left padding as the nav wordmark) and let measures vary. The eye then reads the page as one
  continuous editorial document rather than a stack of centered blocks — a subtle but
  anti-template signal.
- **Where:** `Section.tsx` container, `Hero.tsx`, `Footer.tsx`, `Navbar.tsx` (align left edges).
- **Effort:** S — align left padding tokens; keep max-width for measure.
- **Keep from current build?:** `max-w-5xl` measure stays; alignment becomes consistently
  left-anchored.
- **Sources:** editorial grid-breaking synthesis (consistent optical alignment), design-quality
  bar #7 (grid-breaking editorial composition).

### T22 — Hairline "rule of thirds" section intros
- **Why:** Section intros (the H2 in `Section.tsx`) currently sit flush-left at the container
  start. Nudge the title to a deliberate grid position (e.g. indented to a third, or with a
  short hairline rule above it aligned to a third) so each section open carries quiet grid
  tension instead of a default flush-left heading. Cheap hierarchy, high craft signal.
- **Where:** `Section.tsx` heading wrapper.
- **Effort:** S — small offset / hairline above H2.
- **Keep from current build?:** The `aria-labelledby` heading + `Reveal` stay; only intro
  composition changes.
- **Sources:** editorial grid-breaking synthesis (rule-of-thirds placement), design-quality bar
  #3 (intentional rhythm in spacing).

### T23 — TermPreview = WCAG 1.4.13 hover/focus parity
- **Why:** WCAG 1.4.13 requires hoverable content to also be available on keyboard focus,
  dismissable (Esc), and not trap pointer. `TermPreview` already does this (`tabIndex`,
  `aria-describedby`, Esc-to-close, focus anchors the card). Keep and *test* it: the card must
  never require a mouse, and focus must not close it unless blur/Esc. This is the rare
  anti-template interaction that is also a11y-correct — make it a showcase.
- **Where:** `TermPreview.tsx` (keep logic), add a Playwright keyboard test.
- **Effort:** S — verify + add test; logic exists.
- **Keep from current build?:** The portal + `aria-describedby` + Esc/blur handling stay.
- **Sources:** [WCAG 1.4.13](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html), Rauno spec §3 keyboard rules.

### T24 — Non-text contrast 1.4.11 on focus + dotted term
- **Why:** WCAG 1.4.11 needs UI components (focus ring, the dotted term underline) at 3:1
  against adjacent colors. The accent focus ring (`#0066cc`/`#409cff`) clears 3:1 on both
  surfaces; the dotted `.term-trigger` uses `ink-muted 70%` — verify that mix still clears 3:1
  in *both* themes. In a near-monochrome system the dotted affordance is easy to let slip under
  the floor.
- **Where:** `globals.css` `.term-trigger` mix, `:focus-visible` ring.
- **Effort:** S — measure both themes; bump the mix if needed.
- **Keep from current build?:** Both styles stay; only the contrast floor is enforced.
- **Sources:** [WCAG 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

### T25 — ≥44px tap targets on all text links
- **Why:** The hero CTAs, Contact socials, and back-to-top already use `min-h-11` (44px). Audit
  the remaining text links — nav desktop items (`px-3 py-1.5` with ~24px height), project
  GitHub/Paper links, Writing entries — and ensure coarse-pointer hit areas reach 44px via
  invisible padding (not visible chrome). Templates leave 20px links; this site shouldn't.
- **Where:** `Navbar.tsx` items, `Projects.tsx` links, `Writing.tsx` rows.
- **Effort:** S — add `min-h-11`/padding; no visual change.
- **Keep from current build?:** The `min-h-11` pattern on CTAs/socials/back-to-top stays; extend
  it.
- **Sources:** [WCAG 2.5.8 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), spec §Verification tap targets.

### T26 — `prefers-reduced-motion` = instant underline (full audit)
- **Why:** Already wired via `MotionConfig reducedMotion="user"` + CSS that zeroes `[data-reveal]`
  transform and makes `.link-draw` instant. Audit TermPreview (drops spring+scale — good) and
  the mobile menu (uses `easeOut` transform — should honor reduced motion too) so *every*
  motion is either removed or made instant. Inclusion as a default, not an afterthought.
- **Where:** `TermPreview.tsx`, `Navbar.tsx` mobile sheet, `globals.css`.
- **Effort:** S — audit + maybe one CSS guard on the menu.
- **Keep from current build?:** All reduced-motion handling stays; close the menu gap.
- **Sources:** [Josh Comeau reduced motion](https://www.joshwcomeau.com/animation/prefers-reduced-motion).

### T27 — Visible `:focus-visible` color-independent cue
- **Why:** The accent focus ring is good, but color-blind users may not distinguish accent from
  surroundings. Keep the ring AND ensure the `outline-offset: 2px` + solid 2px outline reads as
  a *shape* cue, not just a color. Don't rely on accent hue alone. (The current `outline` is
  already shape-based — keep it; this is a guardrail, not a change.)
- **Where:** `globals.css` `:focus-visible`.
- **Effort:** S — verify; keep as-is.
- **Keep from current build?:** The accent outline + offset stays exactly.
- **Sources:** [WCAG 2.4.7 focus visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html), [WCAG 1.4.1 use of color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html).

### T28 — Zero-CLS term card (portal off-DOM)
- **Why:** `TermPreview` already renders the preview card through `createPortal` to `document.body`
  and keeps the described text in the DOM as an `sr-only` span, so hovering/focusing never
  reflows the paragraph. That's exactly the CLS-safe pattern. Keep it, and confirm the card
  uses `position: fixed` (it does) so it can't push layout. This protects CLS<0.1 while keeping
  the signature interaction.
- **Where:** `TermPreview.tsx` portal + `fixed` card.
- **Effort:** S — verify; no change.
- **Keep from current build?:** Portal + fixed + sr-only description all stay.
- **Sources:** [web.dev CLS](https://web.dev/articles/cls), spec §3 SSR/no-layout-shift requirement.

### T29 — `next/font` Geist = CLS-free + preload
- **Why:** `layout.tsx` loads Geist via `next/font/google` with `variable` + `display:"swap"`,
  which self-hosts the font, eliminates layout shift, and avoids FOUT. This directly protects
  LCP on the sentence-hero (the largest text paints without a swap jump). Keep exactly; it's the
  right call for a type-led page.
- **Where:** `layout.tsx` Geist import.
- **Effort:** S — keep.
- **Keep from current build?:** The `next/font` setup stays; do not add a second family.
- **Sources:** [Next.js font optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts), project performance rules (FCP<1.5s).

### T30 — Passive scroll-spy (IntersectionObserver)
- **Why:** `useActiveSection` uses `IntersectionObserver` (not a `scroll` event handler), and
  `Navbar` uses `motion`'s `useScroll` which is passive/rAF-throttled. Both are INP-friendly — no
  main-thread scroll churn. Keep; this is already the right pattern for a sticky nav on a long
  page.
- **Where:** `useActiveSection.ts`, `Navbar.tsx` `useScroll`.
- **Effort:** S — keep; audit for any stray `scroll` listeners.
- **Keep from current build?:** IO scroll-spy + `useScroll` stay exactly.
- **Sources:** [web.dev INP](https://web.dev/articles/inp), project performance rules (INP<200ms).

### T31 — `content-visibility: auto` on below-fold sections
- **Why:** A long single page (Hero→About→Skills→Projects→Writing→Contact) pays render/style
  cost for offscreen sections on first paint. Adding `content-visibility: auto` +
  `contain-intrinsic-size` to each `Section` lets the browser skip rendering work below the fold,
  improving TBT/INP with no visual change. Cheap win, but needs `contain-intrinsic-size` so
  scrollbar height stays stable (avoiding CLS).
- **Where:** `Section.tsx` wrapper (add the utility), or a `.section-cv` class in `globals.css`.
- **Effort:** M — add class + intrinsic-size; test scrollbar stability.
- **Keep from current build?:** Section structure + `Reveal` stay; only a render hint is added.
- **Sources:** [web.dev content-visibility](https://web.dev/articles/css-content-visibility).

### T32 — Avoid layout-shifting `Reveal` initial offset
- **Why:** `Reveal` animates `opacity` + `y:16` only (compositor-friendly), and the reduced-motion
  CSS zeroes `[data-reveal]` transform so nothing sits translated. Keep: never animate
  `width/height/top/left/margin/padding` (the project's animation rules forbid it). The `y:16`
  is transform-only, so it's CLS-safe. Audit any future motion for the same.
- **Where:** `Reveal.tsx`, `globals.css` reduced-motion block.
- **Effort:** S — audit; keep as-is.
- **Keep from current build?:** `Reveal` transform/opacity-only approach stays.
- **Sources:** project performance rules (animate compositor-friendly properties only).

### T33 — Data-layer pattern (typed content arrays)
- **Why:** The base spec's best decision: all copy lives in `src/data/` as typed interfaces
  (`site.ts`, `projects.ts`, `posts.ts`, `skills.ts`, `nav.ts`, `terms.ts`), components hardcode
  only display headlines. This is the structural anti-template move — the *design* is the
  system, content swaps without touching layout. Keep it as the foundation everything else
  builds on.
- **Where:** `src/data/*` (keep), component files (keep hardcoded only headlines).
- **Effort:** S — keep; add no content in components.
- **Keep from current build?:** The entire data-layer pattern stays; it's the reason the pivot
  was low-risk.
- **Sources:** base spec §Architecture (data-layer pattern ported from `~/Desktop/Porto`).

### T34 — Narrative arc: thesis → evidence → POV
- **Why:** The section order (Hero sentence → About/Skills → Projects/Writing → Contact + POV
  closing) reads as a *document with an argument*, not a nav-menu of equal blocks. The sentence
  is the thesis, Projects/Writing are the evidence, the closing "Clean the data…" is the
  resolution. Anti-template pages have a point of view; this order is the POV made structural.
  Keep the order; it's a deliberate decision in the spec.
- **Where:** `page.tsx` section order.
- **Effort:** S — keep order; no change.
- **Keep from current build?:** Section order + the POV closing placement stay exactly.
- **Sources:** Rauno spec §1 (one sentence hero) + §6 (POV closing); reject-list (no repeated CTA).

### T35 — Hiring-manager scan value preserved
- **Why:** The de-boxing (Projects → editorial list, Skills → hairline blocks, tags as
  dot-separated text) removed *visual* chrome but kept every *informational* signal a hiring
  manager scans: category, tags, year, status, `featured` scale bump. This is the trap most
  "minimal" redesigns fall into — they delete the scan value. Audit that nothing further removes
  a signal (e.g. don't drop `year` or `category` in the name of purity).
- **Where:** `Projects.tsx` row 3 (tags+category), `featured` title scale, `Skills.tsx` chips.
- **Effort:** S — audit; keep all signals.
- **Keep from current build?:** Tag-as-text, category line, `featured` bump, Skills chips all
  stay.
- **Sources:** Rauno spec §4 (tags chrome deleted, data kept; `featured` drives scale not boxes).

### T36 — Single source of truth for nav/section ids
- **Why:** `nav.ts` exports `navItems` + `sectionIds`; `Navbar` maps `navItems` and
  `useActiveSection(sectionIds)` consumes the same `sectionIds`. One map drives both the nav and
  the scroll-spy, so a rename can't desync them. Keep this; it's the kind of structural
  correctness that separates a crafted site from a duct-taped one.
- **Where:** `src/data/nav.ts`, `Navbar.tsx`, `useActiveSection.ts`.
- **Effort:** S — keep; add new sections to `nav.ts` only.
- **Keep from current build?:** The `navItems`/`sectionIds` single source stays.
- **Sources:** base spec §Data layer (`nav.ts`).

### T37 — `terms.ts` as extensible preview registry
- **Why:** `TermPreview` takes a typed `TermId` from `terms.ts`; adding a preview is one data
  entry + one inline `<TermPreview term="...">` wrap, and a missing id is a compile error. The
  signature interaction stays *cheap to grow* without scope creep (spec caps v1 at 4 terms).
  Keep the registry pattern; it's what makes "exactly one obsessed-over interaction" sustainable.
- **Where:** `src/data/terms.ts`, `TermPreview.tsx` `TermId` type.
- **Effort:** S — keep; extend only when a real term justifies it.
- **Keep from current build?:** The typed registry + compile-time safety stay.
- **Sources:** Rauno spec §3 (four terms in v1; adding = one entry + one wrap).

---

## Loop summary

- **Facets covered (8 of 10):** Typography & rhythm (P1), Color & contrast (P2), Depth &
  layering (P3), Motion & micro-interaction (P4), Layout & composition (P5), Accessibility &
  inclusion (P6), Performance & Core Web Vitals (P7), Content & information architecture (P8).
- **Not reached (pass cap hit at 8):** #9 SEO & metadata, #10 Dark/light theme craft. Both are
  already well-covered by the base spec (robots/sitemap/OG/Twitter in `layout.tsx` + `opengraph-image.tsx`;
  `next-themes` class strategy with no-flash script, both themes first-class). The only additive
  ideas would be: (9) add `alternates`/`canonical` + JSON-LD Person schema for the AI-engineer
  POV; (10) run the T7 `oklch` no-hue-shift audit so dark mode is a recolor not a redesign. Both
  are captured in spirit by T7/T9 and the existing metadata, so they were not net-new enough to
  warrant an extra pass.
- **Stalls:** 0 (every pass added ≥1 net-new idea; dedup kept the table honest).
- **Passes used:** 8 (cap reached).

### Recommended minimal pivot path

**Keep (the pivot already shipped most of the Rauno spec — protect it):**
- Sentence-hero H1 + status pill + `.link-rest` CTAs (`Hero.tsx`)
- `.link-draw` colorless underline language + `.link-active` scroll-spy state (`globals.css`, `Navbar.tsx`)
- `TermPreview` portal/spring/keyboard tooltip (`TermPreview.tsx`, `terms.ts`)
- De-boxed editorial lists (Projects `divide-y`, Writing, Skills/About hairline blocks)
- One accent moment (`ButtonLink` email CTA) + focus ring + `::selection` + status dot
- POV closing in `contact.closing`; `Section`/`Reveal` primitives; `useActiveSection` IO scroll-spy
- Data-layer pattern; `next/font` Geist; reduced-motion handling

**Change (the highest-impact, lowest-effort sharpening from the table — all S/M, no new deps):**
1. **T21 / T19 — left-anchor the whole page.** Drop centered hero + centered section blocks; fix
   one left text edge (T21) and left-anchor the hero (T19). Biggest anti-template signal, ~S effort.
2. **T1 / T2 / T3 / T4 — typographic character.** Fluid `clamp()` scale on section headings (T1),
   `text-wrap: pretty` on body (T2), `tabular-nums` on meta (T3), a tracking ramp (T4). All S, all
   in `globals.css`/tokens.
3. **T5 — give the POV closing its own display size** so the manifesto lands as a manifesto.
4. **T10 — sticky "context" rail** in About/Skills (M) for depth-through-relationship, not cards.
5. **T20 — asymmetric 12-col Projects/Writing** (M) so the lists read as a real editorial index.
6. **T6 / T7 / T9 — color discipline.** Freeze `--ink-muted` AA floors (T6), consolidate hairlines
   into one `color-mix` tint token (T9), and optionally migrate tokens to `oklch` for a true
   recolor dark mode (T7, M).
7. **T23–T27 — a11y audit pass** (all S): verify TermPreview 1.4.13 parity, 3:1 on dotted term +
   focus, 44px targets on nav/project links, reduced-motion on the mobile menu.

**Reject (per hard rules):** any centered-hero+gradient-blob+CTA, uniform card grids, a second
accent color, glassmorphism beyond the single nav plane, parallax/scroll-jacking, unmodified
library defaults. None of the captured ideas violate these.

**Net:** the redesign is already ~80% of the way to the Rauno POV. The remaining work is
*voice-tuning* (left-anchor, fluid type, sticky rail, asymmetric lists, color discipline) — not
a rebuild. Estimated: mostly S-effort tokens + 2 M-effort layout passes, zero new dependencies.
- **Recommended minimal pivot path:** (filled in at end).
