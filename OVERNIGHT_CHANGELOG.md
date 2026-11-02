# Overnight changelog: motion and interaction pass

Branch `v2-motion`, cut from `v2-redesign`. Local commits only: nothing is pushed, merged or deployed.

```
git log --oneline v2-redesign..v2-motion
git diff v2-redesign...v2-motion --stat
```

Every number on the page still comes from `src/data`, the copy is unchanged apart from new interface labels and hints (the kernel switch, the chart and tool hints, the sketch captions, the gain bracket), and the design constraints in `CLAUDE.md` still hold: one accent, sharp corners, no dashes in copy, reduced motion shows final states.

## Result

| Check | Before (v2-redesign) | After (v2-motion) |
|---|---|---|
| Lighthouse mobile, performance | 95 (median of 5) | 96 (median of 4, range 92 to 96) |
| Mobile total blocking time | 80 to 130 ms | 10 to 60 ms |
| Lighthouse desktop, perf / a11y / best practices / SEO | 100 / 100 / n.a. / n.a. | 100 / 100 / 100 / 100 |
| CLS | 0 | 0 |
| JS transferred | 228 KB | 226 KB |
| Unit tests | 16 | 26 |
| E2E tests | 30 | 37 |
| Horizontal overflow, 320 to 1920 | 0 | 0 |
| WebKit (Safari engine), smoke and motion specs | 28 of 29 (focus trap) | 29 of 29 |

Typecheck, lint and `next build` are clean, with no errors or warnings. The WebKit row ran once against each branch with a temporary config; the committed suite is Chromium only. The first Lighthouse run against a cold server always scores lower (76 before, 71 after); it is left out of both medians.

## Architecture

- **One animation system.** `motion` is removed. GSAP 3.15 with ScrollTrigger, SplitText and CustomEase is registered once in `src/lib/gsap.ts`. The site's CSS curve `cubic-bezier(0.16, 1, 0.3, 1)` is the named ease `site-out`, so JS and CSS motion share it. Running both libraries would have cost bundle size and blocking time against the 90+ mobile bar.
- **Lenis** (`src/components/SmoothScroll.tsx`) runs on `gsap.ticker` and feeds `ScrollTrigger.update`. Reduced motion keeps native scrolling, and touch is never smoothed.
  - Same-page anchors glide and still update the URL hash.
  - Keyboard activation and the skip link stay native, so focus moves.
  - The training table carries `data-lenis-prevent`.
  - ScrollTrigger re-measures when the page changes height, for example when the table opens.
- **SSR safety.** All motion lives in client components. Animations are built in `useGSAP` or `useIdleGSAP` and reverted on unmount, and every one branches through `gsap.matchMedia()`.
- **Idle setup** (`src/hooks/useIdleGSAP.ts`). Everything below the fold builds its triggers after hydration, in idle time. Building them all during hydration made one 359 ms task and pushed mobile performance to 88. This change is why blocking time is now lower than the baseline's.
- **No blink on mid-page loads.** Motion used to write hidden states into the server HTML; GSAP can't, so content paints visible first. Any entrance whose element is already in or above the viewport when it is built is skipped (`alreadyInView` in `src/lib/motion.ts`). Reloading halfway down, or opening `/#about`, shows content at rest instead of hiding and replaying it.

## Hero

- **Kernel switch.** Sobel, Laplacian, Gaussian and Edge mask, as an `aria-pressed` button group beside the CTAs.
  - Every kernel runs a real convolution over the rendered headline (`hero/kernels.ts`, unit-tested).
  - Switching re-scans the lens: the old output wipes away left to right behind an orange scan line.
  - The strip sentence names the kernel that ran and its measured cost, and it is a polite live region.
- **Spring lens.** Damped spring (stiffness 320, damping ratio 0.78), stepped at a fixed rate so it behaves the same at any frame rate, and clamped to the headline plate.
- **Entrance.** One GSAP timeline brings in the nav, eyebrow, actions, kernel switch, a drawn rule and the strip, then the status dot pings twice. A head script hides those elements before first paint, so they don't flash, with a 3 s CSS failsafe. If hydration arrives after 2.5 s, the entrance is skipped so the failsafe's reveal is never undone.

## Work

- **Training curve**
  - Still scroll-drawn.
  - Once the clock reaches epoch 40, a bracket draws from the supervised-only 0.493 line up to the 0.621 peak, and the peak marker pops in.
  - The crosshair glides between epochs and shows all four real metrics. It works by touch drag too.
  - The plot is now a keyboard slider (arrows, PageUp and PageDown, Home, End), with the metrics as its value text.
  - The `<details>` table is unchanged.
- **PPE method steps** (`ApproachSteps`) sit on a rail that scroll draws downward, filling each step's node and number as the rail reaches it.
- **FinRAG-ID**
  - A request packet runs the pipeline rail and lights each stage as it arrives. It pauses off screen.
  - Hovering or focusing a tool pill highlights the stages it runs in and dims the rest; a click or tap pins the highlight.
  - The tool-to-stage mapping is `uses` per step in `projects.ts`, read from the repo README, with tests that every tag maps to a stage.
- **Also built**
  - Each row has a pointer spotlight and a lit stretch of its top rule.
  - Each row has a mechanism sketch: broker summaries read session by session, with accumulation turning into distribution (Bandar Tracker); questions scored on faithfulness and context recall (RAG harness); and a causal mask filling token by token with a growing K and V cache (Tiny Transformer).
  - The sketches play on hover, or once in view on touch.

## About, contact, footer

- **About.** The lead rises line by line through SplitText masks. Tools became a hairline matrix with one tool per row; each column draws its rule, then its tools cascade in.
- **Contact.** Each imperative rises word by word out of padded masks and settles from a slight tilt. The email button and social links pull toward the pointer and spring back.
- **Sign-off.** The drawn timestep eases toward the scroll position's timestep, so a wheel flick rewinds the noise smoothly. It still reaches `t = 0` at the page end and still pauses off screen and in hidden tabs.

## Where I departed from the brief

| Brief | Shipped | Why |
|---|---|---|
| Kernel switcher "on the HUD badge" | Button group beside the CTAs; the badge shows the active kernel | The lens ignores pointer input and chases the cursor, so a control inside it can't be clicked |
| "Edge Magnitude" kernel | "Edge mask" (Sobel thresholded at the readout's cutoff) | Sobel's output already *is* edge magnitude, so the option would have duplicated Sobel. The mask shows exactly the pixels the readout counts |
| "% edge px" for every kernel | Gaussian reports "% ink" | A blur has no edges to count; mean ink under the window is what it measures |
| GSAP entrance for the hero headline | Nav, eyebrow, actions and strip animate; the headline enters through its Sobel scan | The H1 is the largest paint (LCP), and the filter reads its live layout, so hiding or moving it would cost both |
| "+0.128 gain" highlighted on the chart | Bracket labelled "Pseudo-labeling gain", no number | +0.128 is the large figure just below, and the constraints say each number appears once per view |
| Sparkline and metric-bar micro-visuals | Mechanism sketches labelled "Schematic", no values | Bandar's repo is private and the harness has no published scores, so bars or a sparkline would read as results |
| Border "glow" on cards | Ink spotlight and lit rule, no orange | Orange is reserved for computed output and the one primary action |
| Lenis `anchors` option | Own anchor handler | Lenis scrolls without `preventDefault`, so the browser's hash jump would fight the glide |
| Brief's "[S1]–[Sn]" and "1–50" | "[S1] to [Sn]" | No en or em dashes in visible copy |

## Bugs found and fixed on the way

- Phase 1 caused the nav to lose its background at the very bottom of the page: a ScrollTrigger ending at `"max"` goes inactive there. Fixed, with a test.
- The chart's scroll range was skewed by its Reveal wrapper's entrance transform, so epoch 50 read as 48. It now measures layout position, as Motion did.
- Opening the mobile menu couldn't focus the first link, because the sheet's visibility transition starts hidden. The transition now flips visibility instantly on open.
- Moving to GSAP made content already on screen blink out and replay its entrance after a mid-page reload or a hash link. Fixed with the in-view guard, and a test that fails without it.
- The mobile menu's focus trap let focus escape in Safari, because WebKit's default Tab order skips links. This predates tonight (it fails on `v2-redesign` too). The trap now moves focus itself on every Tab press.
- Tailwind v4's `translate-y-*` sets the `translate` property, so transitions listing only `transform` snapped the mobile sheet items and the chart's peak label. Both now transition `translate`.

## For Kenny to decide

- Merge `v2-motion` when you're happy with it. I didn't merge or push anything.
- The sketches are illustrations. If you'd rather show nothing than a schematic, remove `sketch` from a project in `src/data/projects.ts`.
- Kernel names and the blur strength (`BLUR_EM` in `SobelHeadline.tsx`) are taste calls.
- GSAP 3.13+ is free to use, commercial use included, under GSAP's own standard license, not MIT. Lenis is MIT.
- `npm audit` reports advisories in dev dependencies that predate this run; I didn't touch them.

## How to review

```
npm ci && npm run build && npm run start   # http://localhost:3000
npm run test && npm run e2e                 # e2e rewrites screenshots/ at 320, 768, 1024, 1440
```

Decision trail: `docs/redesign-v2/decisions.tsv` (rows dated 2026-11-03).
