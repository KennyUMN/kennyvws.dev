# Rauno-Philosophy Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved rauno.me-philosophy redesign (spec: `docs/superpowers/specs/2026-07-13-rauno-philosophy-redesign-design.md`) to the existing Quiet Precision portfolio: single-sentence hero, colorless motion-affordance links, cursor-proximate term previews, de-boxed continuous scroll, one accent moment, POV closing.

**Architecture:** Restyle within the existing Next.js App Router architecture. Keep `Section`/`Reveal` primitives, the `src/data/` content layer, nav focus trap, scroll-spy, and theming. Add one new client component (`TermPreview`), one new data file (`terms.ts`), and CSS utilities in `globals.css`. No new dependencies.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4 (`@theme` tokens in `globals.css`), `motion` v12, next-themes, Vitest, Playwright.

## Global Constraints

- Branch: `redesign/rauno-philosophy`. The working tree starts with an uncommitted partial pass — Task 1 commits it as the baseline; never revert it.
- No new dependencies (`package.json` untouched).
- Compositor-only animation: `transform`/`opacity` only. Global `MotionConfig reducedMotion="user"` already exists in `layout.tsx`.
- No invented copy. The only net-new copy is the closing line: `Clean the data. Fight the training run. Ship the server.` All term-preview copy is exactly as written in Task 3.
- The hero H1 must equal `site.pitch` verbatim (colon form): `I build machine learning systems end to end: computer vision and LLM tooling, from the training loop to the server that keeps it running.` No em dash, no period split.
- Underline-draw must fire on `:focus-visible` as well as `:hover`, and be instant under `prefers-reduced-motion`.
- Text links that replace buttons/icon circles (hero CTAs, Contact socials, footer back-to-top) need ≥44px hit areas (`min-h-11` + `inline-flex items-center`).
- Accent color appears in exactly: the Contact email `ButtonLink`, the hero status dot, `:focus-visible` outline, `::selection`. Nowhere else.
- Commands: `npm test` (Vitest), `npm run e2e` (Playwright; builds + serves on :3100 itself), `npm run typecheck`, `npm run lint`, `npm run build`. Run e2e subsets as `npm run e2e -- tests/e2e/smoke.spec.ts`.
- Commit format `<type>: <description>`, no attribution footer.

---

### Task 1: Commit the baseline working-tree pass

The tree already contains an earlier partial pass (eyebrows removed, hero status block removed, Skills de-carded, read times dropped, Navbar scroll listener rework, metadata DRY). Lock it in as one commit so every later task has a clean diff.

**Files:**
- Modify: none (commit existing state)

- [ ] **Step 1: Verify the baseline is green**

Run: `npm test && npm run typecheck && npm run lint`
Expected: all pass (7 unit tests).

- [ ] **Step 2: Run the e2e smoke suite**

Run: `npm run e2e -- tests/e2e/smoke.spec.ts`
Expected: all 6 tests pass (build takes a few minutes on first run).

- [ ] **Step 3: Commit everything pending**

```bash
git add -A
git commit -m "refactor: de-chrome pass — drop eyebrows, hero status block, skills cards, read times"
```

---

### Task 2: Link language — CSS utilities + Navbar de-pill

**Files:**
- Modify: `src/app/globals.css` (append utilities)
- Modify: `src/components/nav/Navbar.tsx:112-138` (desktop nav block)
- Test: existing `tests/e2e/smoke.spec.ts` (nav, focus trap, theme tests must stay green)

**Interfaces:**
- Produces CSS classes later tasks rely on:
  - `.link-draw` — underline draws on hover/focus-visible (also when a parent `<a>` is hovered/focused); put it on the text `<span>` inside a padded anchor so the line hugs the text.
  - `.link-active` — holds the underline at `scaleX(1)` (nav active state).
  - `.link-rest` — faint always-visible hairline under the text (hero CTAs), full-strength line draws over it.
  - `.term-trigger` — dotted underline, only under `(hover: hover) and (pointer: fine)`.

- [ ] **Step 1: Append the utilities to `globals.css`** (after the `:focus-visible` block)

```css
/* Colorless link language: motion, not color, signals interactivity.
   Place .link-draw on the text span inside a padded anchor so the
   underline hugs the label, not the hit area. */
.link-draw {
  position: relative;
}

.link-draw::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: -2px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right; /* un-hover exits toward the right */
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

:where(
    .link-draw:hover,
    .link-draw:focus-visible,
    a:hover > .link-draw,
    a:focus-visible > .link-draw
  )::after {
  transform: scaleX(1);
  transform-origin: left; /* draws in from the left */
}

.link-active::after {
  transform: scaleX(1);
}

/* At-rest hairline so above-the-fold CTAs read as links before any hover. */
.link-rest {
  border-bottom: 1px solid color-mix(in srgb, currentColor 35%, transparent);
  padding-bottom: 2px;
}

.link-rest::after {
  bottom: -1px; /* draw over the resting hairline */
}

/* Signature term affordance — only where hover exists. */
@media (hover: hover) and (pointer: fine) {
  .term-trigger {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-thickness: 1px;
    text-decoration-color: color-mix(in srgb, var(--ink-muted) 70%, transparent);
    text-underline-offset: 0.25em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .link-draw::after {
    transition: none; /* underline toggles instantly */
  }
}
```

- [ ] **Step 2: De-pill the desktop nav in `Navbar.tsx`**

Replace the desktop nav items block (the `navItems.map` anchor and the Resume anchor inside `<div className="hidden items-center gap-1 md:flex">`) with:

```tsx
{navItems.map((item) => (
  <a
    key={item.id}
    href={item.href}
    aria-current={active === item.id ? "true" : undefined}
    className={cn(
      "px-3 py-1.5 text-sm transition-colors",
      active === item.id ? "text-ink" : "text-ink-muted hover:text-ink"
    )}
  >
    <span className={cn("link-draw", active === item.id && "link-active")}>
      {item.label}
    </span>
  </a>
))}
<a
  href={site.resume}
  className="ml-1 px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
>
  <span className="link-draw">Resume</span>
</a>
```

Leave the mobile sheet, hamburger, wordmark, and all hooks untouched.

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint && npm run e2e -- tests/e2e/smoke.spec.ts`
Expected: all pass — the nav anchor test and focus-trap test exercise the changed markup.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/nav/Navbar.tsx
git commit -m "feat: colorless link language — underline-draw utilities, de-pilled nav"
```

---

### Task 3: Terms data (TDD)

**Files:**
- Create: `src/data/terms.ts`
- Test: `tests/unit/terms.test.ts` (new)

**Interfaces:**
- Produces: `terms` — `Record` keyed by exactly `"computer-vision" | "llm-tooling" | "the-server" | "yolo-pipeline"`, each `{ title: string; meta: string }`; `type TermId = keyof typeof terms`.

- [ ] **Step 1: Write the failing test** (`tests/unit/terms.test.ts`)

```ts
import { expect, test } from "vitest";
import { terms } from "@/data/terms";

test("terms map has exactly the four specced entries", () => {
  expect(Object.keys(terms).sort()).toEqual([
    "computer-vision",
    "llm-tooling",
    "the-server",
    "yolo-pipeline",
  ]);
});

test("every term preview has non-empty title and meta", () => {
  for (const entry of Object.values(terms)) {
    expect(entry.title.length).toBeGreaterThan(0);
    expect(entry.meta.length).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2: Run it — must fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/data/terms`.

- [ ] **Step 3: Create `src/data/terms.ts`** (copy verbatim — this copy is spec-approved)

```ts
export interface TermEntry {
  title: string;
  meta: string;
}

export const terms = {
  "computer-vision": {
    title: "Semi-Supervised PPE Detection",
    meta: "YOLOv9 · research, in submission to Automation in Construction",
  },
  "llm-tooling": {
    title: "RAG eval harness · doc Q&A agent",
    meta: "Local-first, measured before trusted",
  },
  "the-server": {
    title: "Linux homeserver",
    meta: "Docker · self-hosted, monitored",
  },
  "yolo-pipeline": {
    title: "Semi-Supervised PPE Detection",
    meta: "2025 · Research, in submission",
  },
} as const satisfies Record<string, TermEntry>;

export type TermId = keyof typeof terms;
```

- [ ] **Step 4: Run tests — must pass**

Run: `npm test`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/terms.ts tests/unit/terms.test.ts
git commit -m "feat: term preview data for the signature interaction"
```

---

### Task 4: TermPreview component

**Files:**
- Create: `src/components/ui/TermPreview.tsx`

**Interfaces:**
- Consumes: `terms`, `TermId` from Task 3; `.term-trigger` CSS from Task 2; `EASE_OUT` from `@/components/ui/Reveal`.
- Produces: `<TermPreview term={TermId}>{inline text}</TermPreview>` — spans only (safe inside `<h1>`/`<p>`). Renders `data-testid={"term-" + term}` on the trigger and `data-testid="term-card"` on the floating card (Task 5's e2e tests depend on both).

Behavior contract (from spec §3): mouse hover → card floats near cursor, spring-lagged, viewport-clamped; keyboard focus → card below the term; Escape/blur/pointer-leave closes; touch pointers ignored; SR description always resolvable via a static `sr-only` span (`aria-describedby`); the visual card itself is `aria-hidden`; reduced motion → no spring tracking (global `MotionConfig` already strips the scale animation).

- [ ] **Step 1: Create the component** (no test runner covers components — e2e lands in Task 5)

```tsx
"use client";

import { useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { terms, type TermId } from "@/data/terms";
import { EASE_OUT } from "@/components/ui/Reveal";

const CURSOR_OFFSET_X = 14;
const CURSOR_OFFSET_Y = 20;
const CARD_MAX_WIDTH = 260;
const CARD_HEIGHT_ESTIMATE = 76;
const VIEWPORT_MARGIN = 12;
const SPRING = { stiffness: 400, damping: 40 };

function canHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function TermPreview({
  term,
  children,
}: {
  term: TermId;
  children: React.ReactNode;
}) {
  const { title, meta } = terms[term];
  const descriptionId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, SPRING);
  const springY = useSpring(rawY, SPRING);
  // Reduced motion: card sits where it opened, no cursor-lag tracking.
  const x = reducedMotion ? rawX : springX;
  const y = reducedMotion ? rawY : springY;

  const clampToViewport = (cx: number, cy: number) => ({
    x: Math.max(
      VIEWPORT_MARGIN,
      Math.min(cx, window.innerWidth - CARD_MAX_WIDTH - VIEWPORT_MARGIN)
    ),
    y: Math.max(
      VIEWPORT_MARGIN,
      Math.min(cy, window.innerHeight - CARD_HEIGHT_ESTIMATE - VIEWPORT_MARGIN)
    ),
  });

  const place = (cx: number, cy: number, immediate: boolean) => {
    const p = clampToViewport(cx, cy);
    if (immediate) {
      rawX.jump(p.x);
      rawY.jump(p.y);
      springX.jump(p.x);
      springY.jump(p.y);
    } else {
      rawX.set(p.x);
      rawY.set(p.y);
    }
  };

  return (
    <span
      ref={triggerRef}
      data-testid={`term-${term}`}
      className="term-trigger"
      tabIndex={0}
      aria-describedby={descriptionId}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        place(e.clientX + CURSOR_OFFSET_X, e.clientY + CURSOR_OFFSET_Y, true);
        setOpen(true);
      }}
      onPointerMove={(e) => {
        if (!open || e.pointerType !== "mouse") return;
        place(e.clientX + CURSOR_OFFSET_X, e.clientY + CURSOR_OFFSET_Y, false);
      }}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => {
        if (!canHover()) return;
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        place(rect.left, rect.bottom + 8, true);
        setOpen(true);
      }}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      {children}
      <span id={descriptionId} className="sr-only">
        {title} — {meta}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            data-testid="term-card"
            aria-hidden
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            style={{ x, y, maxWidth: CARD_MAX_WIDTH }}
            className="pointer-events-none fixed left-0 top-0 z-50 block rounded-xl border border-edge bg-raised px-4 py-3 text-left shadow-soft"
          >
            <span className="block text-sm font-semibold text-ink">{title}</span>
            <span className="mt-1 block text-[13px] leading-snug text-ink-muted">
              {meta}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
```

- [ ] **Step 2: Verify it compiles and lints (no consumer yet)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: all clean. If `motion` v12 flags `.jump()` as missing on the `useSpring` value, drop the two `springX.jump`/`springY.jump` lines — `rawX.jump()` propagates to derived springs in v12.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/TermPreview.tsx
git commit -m "feat: TermPreview — cursor-proximate preview card (signature interaction)"
```

---

### Task 5: Hero — the sentence is the hero (TDD via e2e)

**Files:**
- Modify: `src/components/sections/Hero.tsx` (full rewrite below)
- Test: `tests/e2e/smoke.spec.ts` (update hero test, add three tests, add mobile tap-target describe)

**Interfaces:**
- Consumes: `TermPreview` (Task 4), `.link-draw`/`.link-rest` (Task 2), `site` from `@/data/site`, `EASE_OUT` from Reveal.

- [ ] **Step 1: Update/add the e2e tests first**

In `tests/e2e/smoke.spec.ts`, replace the first test (`"hero renders headline and availability pill"`) with:

```ts
test("hero H1 is the full pitch, spoken once", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText("machine learning systems");
  await expect(h1).toContainText("the server that keeps it running.");
  await expect(
    page.getByText("Open to AI Engineer roles").first()
  ).toBeVisible();
});

test("hovering a hero term reveals its preview card", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("term-computer-vision").hover();
  const card = page.getByTestId("term-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("Semi-Supervised PPE Detection");
});

test("term preview opens on keyboard focus and closes on Escape", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("term-computer-vision").focus();
  await expect(page.getByTestId("term-card")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("term-card")).toBeHidden();
});
```

And append at the end of the file:

```ts
test.describe("mobile tap targets", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hero CTAs meet 44px hit areas", async ({ page }) => {
    await page.goto("/");
    for (const name of [/See projects/, /GitHub/]) {
      const box = await page
        .getByRole("link", { name })
        .first()
        .boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
});
```

- [ ] **Step 2: Run them — the three new/changed tests must fail**

Run: `npm run e2e -- tests/e2e/smoke.spec.ts`
Expected: `hero H1 is the full pitch` FAILS (H1 lacks "the server that keeps it running.") and both term tests FAIL (no `term-*` testids). The tap-target test may pass or fail against today's filled buttons — either is fine; it exists to guard the text-link replacements. Pre-existing tests still pass.

- [ ] **Step 3: Rewrite `Hero.tsx`**

```tsx
"use client";

import { motion } from "motion/react";
import { site } from "@/data/site";
import { TermPreview } from "@/components/ui/TermPreview";
import { EASE_OUT } from "@/components/ui/Reveal";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export function Hero() {
  return (
    <section
      id="top"
      aria-label="Introduction"
      className="scroll-mt-24 px-6 pb-[clamp(4rem,2.5rem+4vw,7rem)] pt-32 sm:pt-40"
    >
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-5xl"
      >
        <motion.p
          data-reveal
          variants={item}
          className="flex items-center gap-2 text-sm text-ink-muted"
        >
          <span aria-hidden className="size-2 rounded-full bg-accent" />
          Open to AI Engineer roles
        </motion.p>

        <motion.h1
          data-reveal
          variants={item}
          className="mt-8 max-w-4xl text-balance text-[clamp(1.9rem,1rem+3vw,3.25rem)] font-semibold leading-[1.15] tracking-tight"
        >
          I build machine learning systems end to end:{" "}
          <TermPreview term="computer-vision">computer vision</TermPreview> and{" "}
          <TermPreview term="llm-tooling">LLM tooling</TermPreview>, from the
          training loop to{" "}
          <TermPreview term="the-server">the server</TermPreview> that keeps it
          running.
        </motion.h1>

        <motion.div
          data-reveal
          variants={item}
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2"
        >
          <a
            href="#work"
            className="inline-flex min-h-11 items-center gap-1.5 text-lg font-medium"
          >
            <span className="link-draw link-rest">See projects</span>
            <span aria-hidden>→</span>
          </a>
          <a
            href={site.socials.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-lg font-medium"
          >
            <span className="link-draw link-rest">GitHub</span>
            <span aria-hidden>↗</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

The rendered H1 text must equal `site.pitch` exactly — if the assertion in Step 4 disagrees, fix the JSX, not the pitch.

- [ ] **Step 4: Run the suite — all pass now**

Run: `npm run e2e -- tests/e2e/smoke.spec.ts && npm run typecheck && npm run lint`
Expected: PASS (9 e2e tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Hero.tsx tests/e2e/smoke.spec.ts
git commit -m "feat: single-sentence hero with term previews and text-link CTAs"
```

---

### Task 6: De-box About facts + Writing chip; wire the About term

**Files:**
- Modify: `src/components/sections/About.tsx` (full rewrite below)
- Modify: `src/components/sections/Writing.tsx:13-30` (row markup)

**Interfaces:**
- Consumes: `TermPreview` (Task 4). `about` from `@/data/site` is unchanged.

- [ ] **Step 1: Rewrite `About.tsx`**

```tsx
import { about } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { TermPreview } from "@/components/ui/TermPreview";

const PIPELINE_PHRASE = "semi-supervised YOLOv9 pipeline";

function withPipelineTerm(paragraph: string): React.ReactNode {
  const index = paragraph.indexOf(PIPELINE_PHRASE);
  if (index === -1) return paragraph;
  return (
    <>
      {paragraph.slice(0, index)}
      <TermPreview term="yolo-pipeline">{PIPELINE_PHRASE}</TermPreview>
      {paragraph.slice(index + PIPELINE_PHRASE.length)}
    </>
  );
}

export function About() {
  return (
    <Section id="about" title="The unglamorous parts, done well.">
      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-muted">
          {about.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p>{withPipelineTerm(paragraph)}</p>
            </Reveal>
          ))}
        </div>
        <div className="space-y-8">
          {about.facts.map((fact, i) => (
            <Reveal key={fact.title} delay={i * 0.08}>
              <div className="border-t border-edge pt-6">
                <h3 className="text-[15px] font-semibold">{fact.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">
                  {fact.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Flatten the Writing chip**

In `Writing.tsx`, replace the title-row + meta markup inside the row `<div>` with (drop the chip `<span>`; the "Draft" label moves into the meta line):

```tsx
<div className="max-w-2xl">
  <h3 className="text-lg font-semibold tracking-tight">{post.title}</h3>
  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
    {post.excerpt}
  </p>
</div>
<p className="shrink-0 text-sm text-ink-muted">
  Draft · {post.tag} · {formatDate(post.date)}
</p>
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: clean. (Reduced-scope check — no e2e touches these sections; screenshots in Task 9 cover them visually.)

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/About.tsx src/components/sections/Writing.tsx
git commit -m "feat: de-box About facts and Writing rows, wire About term preview"
```

---

### Task 7: Projects — editorial list (TDD via e2e)

**Files:**
- Modify: `src/components/sections/Projects.tsx` (full rewrite below)
- Delete: `src/components/ui/Tag.tsx`
- Test: `tests/e2e/smoke.spec.ts` (replace the filter test)

**Interfaces:**
- Consumes: `.link-draw` (Task 2). `projects` data and `featured` flag unchanged — `featured` now drives title scale (`text-2xl` vs `text-xl`). The unit test `exactly two projects are featured` must keep passing.

- [ ] **Step 1: Replace the filter e2e test**

In `tests/e2e/smoke.spec.ts`, replace the entire `"project filter narrows and restores the grid"` test with:

```ts
test("work section is an editorial list, not a filtered grid", async ({
  page,
}) => {
  await page.goto("/");
  const entries = page.locator("#work article");
  await expect(entries).toHaveCount(5);
  await expect(entries.first()).toContainText("Semi-Supervised PPE Detection");
  await expect(entries.first()).toContainText("YOLOv9");
  await expect(page.locator("#work").getByRole("button")).toHaveCount(0);
});
```

- [ ] **Step 2: Run it — must fail**

Run: `npm run e2e -- tests/e2e/smoke.spec.ts`
Expected: the new test FAILS (`#work` currently contains 4 filter buttons).

- [ ] **Step 3: Rewrite `Projects.tsx`** (server component now — no state, no motion imports)

```tsx
import { projects } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export function Projects() {
  return (
    <Section id="work" title="A problem, an approach, an outcome.">
      <ul className="divide-y divide-edge border-y border-edge">
        {projects.map((project, i) => (
          <li key={project.title}>
            <Reveal delay={i * 0.05}>
              <article className="py-8 sm:py-9">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3
                    className={cn(
                      "font-semibold tracking-tight",
                      project.featured ? "text-2xl" : "text-xl"
                    )}
                  >
                    {project.title}
                  </h3>
                  <p className="text-sm text-ink-muted">
                    {project.year} · {project.status}
                  </p>
                </div>
                <p className="mt-3 max-w-2xl text-[15px] font-medium">
                  {project.blurb}
                </p>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-ink-muted">
                  <p>{[project.category, ...project.tags].join(" · ")}</p>
                  <span className="flex items-center gap-5">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-1 font-medium transition-colors hover:text-ink"
                    >
                      <span className="link-draw">GitHub</span>
                      <span aria-hidden>↗</span>
                    </a>
                    {project.paper && (
                      <a
                        href={project.paper}
                        className="inline-flex min-h-11 items-center gap-1 font-medium transition-colors hover:text-ink"
                      >
                        <span className="link-draw">Paper</span>
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                  </span>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
```

- [ ] **Step 4: Delete the orphaned Tag component**

```bash
rm src/components/ui/Tag.tsx
```

Then confirm nothing still imports it: `grep -rn "ui/Tag" src/` — expected: no output.

- [ ] **Step 5: Run the suite — all pass**

Run: `npm test && npm run typecheck && npm run lint && npm run e2e -- tests/e2e/smoke.spec.ts`
Expected: PASS everywhere (unit featured-count test included).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: projects as an editorial hairline list — filters, cards, tag pills removed"
```

---

### Task 8: Contact + closing statement, slim ButtonLink, Footer (TDD via e2e)

**Files:**
- Modify: `src/data/site.ts:40-43` (add `closing` to `contact`)
- Modify: `src/components/sections/Contact.tsx` (full rewrite below)
- Modify: `src/components/ui/ButtonLink.tsx` (full rewrite below)
- Modify: `src/components/sections/Footer.tsx:10-12` (back-to-top link)
- Test: `tests/e2e/smoke.spec.ts` (add closing test)

**Interfaces:**
- Consumes: `.link-draw` (Task 2).
- Produces: `ButtonLink` now `{ href, children, className? }` only — the `variant`/`external` props are gone; Contact is its sole consumer (verify in Step 5).

- [ ] **Step 1: Add the closing e2e test** (append near the other top-level tests)

```ts
test("the page closes with the POV statement", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Clean the data. Fight the training run. Ship the server.")
  ).toBeVisible();
});
```

- [ ] **Step 2: Run it — must fail**

Run: `npm run e2e -- tests/e2e/smoke.spec.ts`
Expected: the new test FAILS (text not on page).

- [ ] **Step 3: Add the closing line to `site.ts`**

```ts
export const contact = {
  framing:
    "Open to AI Engineer roles, internships, and research collaborations.",
  closing: "Clean the data. Fight the training run. Ship the server.",
} as const;
```

- [ ] **Step 4: Rewrite `Contact.tsx`** (icon circles → text links; closing statement ends the narrative)

```tsx
import { contact, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const socialLinks = [
  { label: "GitHub", href: site.socials.github },
  { label: "LinkedIn", href: site.socials.linkedin },
  { label: "X", href: site.socials.x },
];

export function Contact() {
  return (
    <Section id="contact" title="Let's talk.">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-lg leading-relaxed text-ink-muted">
            {contact.framing}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <ButtonLink href={`mailto:${site.email}`}>{site.email}</ButtonLink>
            <ul className="flex items-center gap-x-6">
              {socialLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center text-[15px] font-medium text-ink-muted transition-colors hover:text-ink"
                  >
                    <span className="link-draw">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
      <Reveal>
        <p className="mt-20 max-w-2xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {contact.closing}
        </p>
      </Reveal>
    </Section>
  );
}
```

- [ ] **Step 5: Slim `ButtonLink.tsx`** to the single accent style

```tsx
import { cn } from "@/lib/utils";

export function ButtonLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[15px] font-medium text-accent-contrast shadow-soft transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </a>
  );
}
```

Confirm Contact is the only consumer: `grep -rn "ButtonLink" src/` — expected: `ButtonLink.tsx` itself and `Contact.tsx` only.

- [ ] **Step 6: Footer back-to-top gets the link language**

Replace the anchor in `Footer.tsx` with:

```tsx
<a
  href="#top"
  className="inline-flex min-h-11 items-center gap-1 transition-colors hover:text-ink"
>
  <span className="link-draw">Back to top</span>
  <span aria-hidden>↑</span>
</a>
```

- [ ] **Step 7: Run everything — all pass**

Run: `npm test && npm run typecheck && npm run lint && npm run e2e -- tests/e2e/smoke.spec.ts`
Expected: PASS (11 e2e tests).

- [ ] **Step 8: Commit**

```bash
git add src/data/site.ts src/components/sections/Contact.tsx src/components/ui/ButtonLink.tsx src/components/sections/Footer.tsx tests/e2e/smoke.spec.ts
git commit -m "feat: one accent moment, text socials, POV closing statement"
```

---

### Task 9: Verification sweep — screenshots, contrast, README

**Files:**
- Modify: `README.md:4` (design-direction line)
- Output (not committed): `screenshots/*.png`

- [ ] **Step 1: Full test pass**

Run: `npm test && npm run typecheck && npm run lint && npm run build && npm run e2e`
Expected: everything green (smoke + screenshots specs).

- [ ] **Step 2: Visually review every screenshot**

The e2e run wrote `screenshots/{light,dark}-{320,768,1024,1440}.png`. Open/Read all 8 and check against the spec: single-sentence hero with dotted terms; no pills/cards anywhere except the email CTA; hairline lists for work/writing/skills/about-facts; closing statement present; nothing overflows at 320px; both themes look intentional. Fix regressions before proceeding.

- [ ] **Step 3: Contrast re-check (both themes)**

Run this one-off script (do not commit it) with `node <path>/contrast.mjs` from the scratchpad:

```js
const pairs = [
  ["light ink/surface", "111113", "fafafa"],
  ["light ink-muted/surface", "5d5d66", "fafafa"],
  ["light accent-contrast/accent (email CTA)", "ffffff", "0066cc"],
  ["dark ink/surface", "f5f5f7", "0a0a0b"],
  ["dark ink-muted/surface", "a3a3ad", "0a0a0b"],
  ["dark accent-contrast/accent (email CTA)", "0a0a0b", "409cff"],
];
const lum = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) =>
    parseInt(hex.slice(i, i + 2), 16) / 255
  ).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
for (const [name, fg, bg] of pairs) {
  const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
  const ratio = (l1 + 0.05) / (l2 + 0.05);
  console.log(`${ratio >= 4.5 ? "PASS" : "FAIL"} ${ratio.toFixed(2)}:1 ${name}`);
}
```

Expected: every line PASS (≥ 4.5:1). If any pair fails, adjust the token in `globals.css` minimally and re-run Steps 1–3.

- [ ] **Step 4: Update the README design-direction line**

Change the line mentioning the design direction to:

```markdown
Motion, next-themes. Design direction: Apple-HIG-inspired "Quiet Precision",
evolved with a rauno.me-inspired interaction philosophy — single-sentence hero,
colorless motion-affordance links, cursor-proximate term previews, one accent moment.
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: note the rauno-philosophy evolution in the README"
```

---

## Self-Review Notes (completed)

- **Spec coverage:** hero §1 → Task 5; link language + nav states + tap targets §2 → Tasks 2/5/8; signature §3 → Tasks 3/4/5/6; de-boxing §4 → Tasks 6/7/8; accent moment §5 → Task 8; closing §6 → Task 8; verification → per-task + Task 9. Contrast + screenshots → Task 9.
- **Type consistency:** `TermId` union matches the four ids used in Hero/About; `ButtonLink` prop change verified against its only consumer; `featured` kept — unit test `exactly two projects are featured` untouched.
- **No placeholders:** every code step is complete and copy-exact.
