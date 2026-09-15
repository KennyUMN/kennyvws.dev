# Portfolio Improvement Research — Loop Prompts

Bounded research loops for `~/Projects/kennyvws.dev`. Each loop runs in self-paced
passes: research one facet, dedup against captured ideas, rank, append. Stops on
its own. **Neither loop mutates source code** — write-only to the output doc.

## Shared loop contract

**Role.** Senior frontend design researcher for `~/Projects/kennyvws.dev`
(Next.js App Router, Tailwind v4, `motion`, `next-themes`, React 19).

**Per pass:**
1. Pick the *next unconsidered* facet from the facet list below (in order).
2. Search the web for concrete, *named* techniques — also re-read the relevant
   `docs/superpowers/specs/` and current `src/` so ideas are grounded in this site.
3. For each technique capture: **name**, **one-line "why it fits this direction"**,
   **where it applies** (Nav / Hero / About / Skills / Projects / Writing / Contact /
   Footer / global theme), **effort** (S/M/L).
4. **Dedup** against already-captured ideas before appending. A pass that adds 0
   net-new ideas = a *stall*.

**Stop conditions (any one):** all facets covered · 3 consecutive stalls · 8 passes.

**Hard rules:**
- Never mutate source code. Write only to the output doc.
- Reject any idea on the direction's reject-list.
- Keep a running **ranked table** (by impact-vs-effort) at the top of the doc,
  updated each pass.
- Stay specific and reference real components — no generic advice.

**Facet list (in order):** Typography & rhythm · Color & contrast · Depth & layering
· Motion & micro-interaction · Layout & composition · Accessibility & inclusion ·
Performance & Core Web Vitals · Content & information architecture · SEO & metadata ·
Dark/light theme craft.

---

## Loop A — Sharpen "Quiet Precision"

DIRECTION: Deepen the approved "Quiet Precision" spec
(`docs/superpowers/specs/2026-07-12-kenny-portfolio-design.md`). Make the site MORE
Quiet Precision — softer, more refined, more considered — not reinvent it. Look for
restraint-deepening techniques: tighter type rhythm, subtler depth, more intentional
motion, quieter hover/focus states, better AA contrast discipline in both themes.

REJECT-LIST: neobrutalism, heavy gradients/glow, a second accent color,
glassmorphism-for-its-own-sake, anything that adds visual noise or breaks the
Apple-HIG calm. If an idea makes the site louder, skip it.

OUTPUT: `docs/improvements-quiet-precision.md`

---

## Loop B — Evaluate the Rauno-inspired pivot

DIRECTION: Research how to execute a philosophy-led, anti-template redesign well, in
the spirit of the Rauno spec
(`docs/superpowers/specs/2026-07-13-rauno-philosophy-redesign-design.md`). The site
should express a point of view, not look like a default template. Find techniques for:
opinionated editorial composition, grid-breaking layout, typography with character,
motion that clarifies flow, cohesive atmosphere. For each idea note WHAT TO KEEP from
the current Quiet Precision build (frosted nav, project-filter interaction, data-layer
pattern).

REJECT-LIST: safe gray-on-white template defaults, generic centered-hero + gradient-blob
+ CTA, uniform card grids with no hierarchy, unmodified library defaults passed off as design.

OUTPUT: `docs/improvements-rauno-pivot.md` (include a "Keep from current build?" column)
