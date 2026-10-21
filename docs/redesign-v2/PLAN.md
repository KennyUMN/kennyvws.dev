# Portfolio v2: run plan

Built overnight on branch `v2-redesign` while Kenny was away. Nothing is pushed or deployed.
Decision trail: `docs/redesign-v2/decisions.tsv` (one row per decision, with evidence).

## Definition of done

The run is done when all of these hold on the production build:

1. `npm run typecheck`, `npm run lint`, `npm run test` and `npm run build` pass.
2. The rewritten Playwright suite passes: hero H1 equals `site.pitch`, nav anchors land on their sections,
   résumé link points at the PDF, theme toggle persists across reload, the mobile menu traps and releases focus,
   text links have 44px hit areas, the work section lists all five projects, reduced motion renders a static hero,
   and no page width from 320 to 1920 scrolls horizontally.
3. Full-page screenshots at 320, 768, 1024 and 1440 in light and dark are reviewed by me and by an independent
   design critic on a different model, with no blocking issue left open.
4. Lighthouse on the production build: performance 90+, accessibility 95+, CLS under 0.1.
5. Every number on the page traces to `src/data` and names its source artifact. No em or en dashes in visible copy.
6. Main is untouched. The work is committed locally on `v2-redesign`.

## Scope and rigor

One page, about eight sections, one signature canvas, a rewrite of most components under `src/components`.
Content stays in `src/data`; copy may be tightened but facts are never added.
Rigor is medium-high: every step is reversible (branch only), but design quality is subjective, so the visual
result gets an independent critic and a fix round instead of my own judgment alone.

## Phases

1. Data. Import the real PPE training log and the ablation numbers from the public repo.
2. Direction. Research award-winning portfolios in parallel with three competing hero prototypes
   (three different models, three concepts). Pick or graft one.
3. Spec. Tokens, type, layout family per section, motion rules. Recorded in `CLAUDE.md` (Design Constraints) instead of a separate `DESIGN.md`.
4. Foundation. Fonts, tokens, global styles, layout shell. Remove components the new design orphans.
5. Hero. Port the winning concept, with a static final frame for reduced motion.
6. Work. PPE case study driven by real data, FinRAG-ID pipeline feature (Bandar Tracker until the first critique), compact index of the rest.
7. About, stack, contact, footer, navigation.
8. Tests. Rewrite the e2e suite for the new structure, keep the data invariants.
9. Visual QA. Screenshots at every breakpoint in both themes, fix, repeat.
10. Independent critique in a fresh agent, then a fix round. Done twice (`critique-1.md`, `critique-2.md`). Both critics and the code reviewer ran on the same model family as the author, so they are fresh-context reviews, not cross-model ones.
11. Performance and accessibility pass, OG image refresh.
12. Code review, cleanup, local commit.

## Evidence

Rows in `decisions.tsv` that point into `scratchpad/` refer to a temporary folder from the build session; screenshots, Lighthouse JSON and prototypes there are not kept. The two design critiques are copied here. Everything else can be regenerated: `npm run e2e` rewrites `screenshots/`, and the tests in `tests/` encode each fixed bug.
