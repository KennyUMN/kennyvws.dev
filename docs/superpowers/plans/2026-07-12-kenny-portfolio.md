# kennyvws.dev Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Kenny's single-page portfolio (Apple-HIG-inspired "Quiet Precision" design) per the approved spec at `docs/superpowers/specs/2026-07-12-kenny-portfolio-design.md`.

**Architecture:** Next.js App Router single page composed of seven section components; all copy lives in typed `src/data/` modules; Tailwind v4 CSS-variable tokens drive both themes via `next-themes`; `motion` provides scroll reveals and filter animations. Vitest covers the data layer and utilities; Playwright covers behavior and breakpoint screenshots.

**Tech Stack:** Next.js (App Router, latest stable), TypeScript, Tailwind CSS v4, `motion`, `next-themes`, `react-icons`, Geist Sans via `next/font/google`, Vitest, Playwright.

## Global Constraints

- Repo root: `~/Projects/kennyvws.dev`. All paths below are relative to it. npm is the package manager.
- Next.js must be ≥ 14 (install latest stable). Site title exactly `Kenny — AI Engineer`; `metadataBase` exactly `https://kennyvws.dev`.
- All user-facing copy comes verbatim from the spec's data (originally from Kenny's brief). NEVER invent facts, metrics, companies, or testimonials. Presentation shaping is allowed; new facts are not.
- Every GitHub project link uses its own slug under `https://github.com/KennyUMN/` with a `TODO(Kenny): confirm exact repo name` comment. Never point projects at the bare profile URL.
- Placeholders that stay: `/resume.pdf` (+ `TODO(Kenny): add resume.pdf to public/`), PPE paper link `#`, LinkedIn `https://linkedin.com/in/kenny` (+ `TODO(Kenny): verify LinkedIn URL`).
- Motion (scroll reveals, filter animations, anything continuous) uses compositor-friendly properties only (transform, opacity). Short paint-only CSS hover/press transitions (color, background-color, box-shadow) are fine per the user's web rules; never animate layout-bound properties (width, height, top, margin, padding, border, font-size). Honor `prefers-reduced-motion` via `MotionConfig reducedMotion="user"`.
- Both themes are first-class; text/accent pairs must keep WCAG AA contrast. One accent color only (blue tokens below); no neon.
- Mobile-first: check every section at 320px width mentally as you write it; nothing may overflow horizontally.
- Each task ends with the listed verification passing, then a commit using the conventional format shown (no attribution footers — disabled globally for this user).
- If a named `react-icons` import doesn't exist in the installed version, drop that import and omit the icon — `icon` is optional by design. Never let a missing icon block the build.

---

### Task 1: Scaffold the Next.js app with theme tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `public/.gitkeep`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: design tokens usable as Tailwind classes everywhere: `bg-surface`, `bg-raised`, `bg-surface-muted`, `text-ink`, `text-ink-muted`, `border-edge`, `text-accent`/`bg-accent`, `shadow-soft`, `shadow-lifted`, `font-sans` (Geist). `<main id="main">` exists in `page.tsx` for later tasks to fill. Layout provides `ThemeProvider` (class strategy) + `MotionConfig`.

- [ ] **Step 1: Write config files**

`package.json` (versions resolve at install in Step 2):

```json
{
  "name": "kennyvws.dev",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "e2e": "playwright test"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

`postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

`eslint.config.mjs`:

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", "node_modules/**", "playwright-report/**", "test-results/**"] },
];

export default config;
```

`.gitignore`:

```
node_modules/
.next/
out/
*.tsbuildinfo
.vercel
.DS_Store
screenshots/
test-results/
playwright-report/
```

`public/.gitkeep`: empty file. (Kenny will later add `public/resume.pdf` himself.)

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install next@latest react@latest react-dom@latest motion@latest next-themes@latest react-icons@latest
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss eslint eslint-config-next @eslint/eslintrc vitest @playwright/test
```

Expected: both commands exit 0. If Tailwind's PostCSS setup errors later, the source of truth is the Tailwind v4 Next.js guide — the plugin is `@tailwindcss/postcss`, and `globals.css` uses `@import "tailwindcss"` (no `tailwind.config.js` needed).

- [ ] **Step 3: Write `src/app/globals.css`** (the whole design-token system)

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --surface: #fafafa;
  --raised: #ffffff;
  --surface-muted: #f0f0f2;
  --ink: #111113;
  --ink-muted: #5d5d66;
  --edge: #e4e4e8;
  --accent: #0066cc;
  --shadow-soft: 0 1px 2px rgb(17 17 19 / 0.04), 0 8px 24px rgb(17 17 19 / 0.05);
  --shadow-lifted: 0 2px 4px rgb(17 17 19 / 0.05), 0 16px 40px rgb(17 17 19 / 0.09);
}

.dark {
  --surface: #0a0a0b;
  --raised: #151518;
  --surface-muted: #1e1e23;
  --ink: #f5f5f7;
  --ink-muted: #a3a3ad;
  --edge: #26262b;
  --accent: #409cff;
  --shadow-soft: 0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px rgb(0 0 0 / 0.35);
  --shadow-lifted: 0 2px 4px rgb(0 0 0 / 0.5), 0 16px 40px rgb(0 0 0 / 0.5);
}

@theme inline {
  --color-surface: var(--surface);
  --color-raised: var(--raised);
  --color-surface-muted: var(--surface-muted);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-edge: var(--edge);
  --color-accent: var(--accent);
  --shadow-soft: var(--shadow-soft);
  --shadow-lifted: var(--shadow-lifted);
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

::selection {
  background: var(--accent);
  color: #ffffff;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [ ] **Step 4: Write `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const description =
  "I build machine learning systems end to end — computer vision and LLM tooling, from the training loop to the server that keeps it running.";

export const metadata: Metadata = {
  metadataBase: new URL("https://kennyvws.dev"),
  title: "Kenny — AI Engineer",
  description,
  openGraph: {
    title: "Kenny — AI Engineer",
    description,
    url: "https://kennyvws.dev",
    siteName: "Kenny — AI Engineer",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenny — AI Engineer",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} bg-surface font-sans text-ink antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionConfig reducedMotion="user">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
            >
              Skip to content
            </a>
            {children}
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

If `Geist` is not exported by `next/font/google` in the installed Next version: `npm install geist` and use `import { GeistSans } from "geist/font/sans"` with `GeistSans.variable` instead — same CSS variable name.

- [ ] **Step 5: Write placeholder `src/app/page.tsx`** (sections land in later tasks)

```tsx
export default function Home() {
  return (
    <main id="main">
      <div id="top" />
    </main>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: exits 0, static route `/` generated. Then run `npm run lint` — exits 0.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js app with Tailwind v4 theme tokens and providers"
```

---

### Task 2: Utilities with unit-test setup (TDD)

**Files:**
- Create: `vitest.config.ts`, `tests/unit/utils.test.ts`, `src/lib/utils.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `cn(...classes: Array<string | false | null | undefined>): string` and `formatDate(iso: string): string` (e.g. `"2026-03-12"` → `"Mar 2026"`), both from `@/lib/utils`.

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

- [ ] **Step 2: Write the failing tests** — `tests/unit/utils.test.ts`

```ts
import { expect, test } from "vitest";
import { cn, formatDate } from "@/lib/utils";

test("cn joins truthy class names and drops falsy ones", () => {
  expect(cn("a", false, undefined, "b", null, "c")).toBe("a b c");
});

test("cn returns empty string for no truthy inputs", () => {
  expect(cn(false, undefined)).toBe("");
});

test("formatDate renders short month and year", () => {
  expect(formatDate("2026-03-12")).toBe("Mar 2026");
  expect(formatDate("2025-11-09")).toBe("Nov 2025");
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL — cannot resolve `@/lib/utils`.

- [ ] **Step 4: Write `src/lib/utils.ts`**

```ts
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run`
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/unit/utils.test.ts src/lib/utils.ts
git commit -m "feat: add cn and formatDate utilities with unit tests"
```

---

### Task 3: Data layer (TDD)

**Files:**
- Create: `tests/unit/data.test.ts`, `src/data/site.ts`, `src/data/nav.ts`, `src/data/projects.ts`, `src/data/skills.ts`, `src/data/posts.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (exact exports later tasks import):
  - `@/data/site`: `site` (name, role, pitch, url, email, resume, status: `{label, value}[]`, socials: `{github, linkedin, x}`), `about` (`paragraphs: string[]`, `facts: {title, body}[]`), `contact` (`framing: string`)
  - `@/data/nav`: `NavItem {id,label,href}`, `navItems: NavItem[]`, `sectionIds: string[]`
  - `@/data/projects`: `ProjectCategory` union, `categories: ProjectCategory[]`, `Project` interface, `projects: Project[]`
  - `@/data/skills`: `SkillGroup {category, items: {name, icon?}[]}`, `skillGroups: SkillGroup[]`
  - `@/data/posts`: `Post {title, excerpt, date, readTime, tag, href}`, `posts: Post[]`

- [ ] **Step 1: Write the failing tests** — `tests/unit/data.test.ts`

```ts
import { expect, test } from "vitest";
import { categories, projects } from "@/data/projects";
import { posts } from "@/data/posts";
import { navItems, sectionIds } from "@/data/nav";
import { site } from "@/data/site";

test("there are exactly five projects", () => {
  expect(projects).toHaveLength(5);
});

test("every project links to its own repo slug, never the bare profile", () => {
  for (const p of projects) {
    expect(p.github).toMatch(/^https:\/\/github\.com\/KennyUMN\/[a-z0-9-]+$/);
  }
});

test("github slugs are unique per project", () => {
  const links = projects.map((p) => p.github);
  expect(new Set(links).size).toBe(links.length);
});

test("every project category is a valid filter category", () => {
  for (const p of projects) {
    expect(categories).toContain(p.category);
  }
});

test("exactly two projects are featured", () => {
  expect(projects.filter((p) => p.featured).length).toBe(2);
});

test("writing has four placeholder drafts", () => {
  expect(posts).toHaveLength(4);
  for (const post of posts) {
    expect(post.href).toBe("#");
  }
});

test("nav covers the five anchored sections", () => {
  expect(sectionIds).toEqual(["about", "stack", "work", "writing", "contact"]);
  for (const item of navItems) {
    expect(item.href).toBe(`#${item.id}`);
  }
});

test("site status block has the four entries", () => {
  expect(site.status.map((s) => s.label)).toEqual([
    "Focus",
    "Now",
    "Base",
    "Status",
  ]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL — cannot resolve `@/data/projects` (and the other data modules).

- [ ] **Step 3: Write `src/data/site.ts`**

```ts
export const site = {
  name: "Kenny",
  role: "AI Engineer — Computer Vision & LLM Systems",
  pitch:
    "I build machine learning systems end to end — computer vision and LLM tooling, from the training loop to the server that keeps it running.",
  url: "https://kennyvws.dev",
  email: "hi@kennyvws.dev",
  // TODO(Kenny): add resume.pdf to public/
  resume: "/resume.pdf",
  status: [
    { label: "Focus", value: "Computer vision, LLM tooling" },
    { label: "Now", value: "YOLOv9 PPE detection research" },
    { label: "Base", value: "Tangerang, Indonesia" },
    { label: "Status", value: "Open to AI Engineer roles" },
  ],
  socials: {
    github: "https://github.com/KennyUMN",
    // TODO(Kenny): verify LinkedIn URL — the "kenny" slug is likely someone else's
    linkedin: "https://linkedin.com/in/kenny",
    x: "https://x.com/kennyvws",
  },
} as const;

export const about = {
  paragraphs: [
    "I'm Kenny, a Computer Science student at Universitas Multimedia Nusantara heading toward AI engineering. My current research is a semi-supervised YOLOv9 pipeline for detecting personal protective equipment on construction sites, aimed at the journal Automation in Construction.",
    "I like the unglamorous parts: cleaning the data, fighting the training run, and getting a model to behave on a real server instead of a demo notebook. I build on a Mac and ship to a Linux homeserver with Docker, so things have to work on both.",
    "If a tool is interesting and I can self-host it, I will.",
  ],
  facts: [
    {
      title: "Training",
      body: "I train and debug models myself, not just call an API. Vision, tabular, and small transformers.",
    },
    {
      title: "Shipping",
      body: "Models that stay on a laptop don't count. I package, serve, and monitor what I build.",
    },
    {
      title: "Writing",
      body: "I document what I learn. If a paper is interesting and the code is messy, I port it and write it up.",
    },
  ],
} as const;

export const contact = {
  framing:
    "Open to AI Engineer roles, internships, and research collaborations.",
} as const;
```

- [ ] **Step 4: Write `src/data/nav.ts`**

```ts
export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { id: "about", label: "About", href: "#about" },
  { id: "stack", label: "Stack", href: "#stack" },
  { id: "work", label: "Work", href: "#work" },
  { id: "writing", label: "Writing", href: "#writing" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export const sectionIds = navItems.map((item) => item.id);
```

- [ ] **Step 5: Write `src/data/projects.ts`**

```ts
export type ProjectCategory = "Computer Vision" | "LLM / Agents" | "ML Systems";

export const categories: ProjectCategory[] = [
  "Computer Vision",
  "LLM / Agents",
  "ML Systems",
];

export interface Project {
  title: string;
  blurb: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  year: string;
  status: string;
  featured?: boolean;
  github: string;
  paper?: string;
}

export const projects: Project[] = [
  {
    title: "Semi-Supervised PPE Detection",
    blurb: "YOLOv9 + pseudo-labeling for construction-site safety gear.",
    description:
      "Detects hardhats, vests, and missing PPE on construction sites. Uses a semi-supervised pseudo-labeling loop to cut manual annotation, with a confidence-thresholded teacher-student setup. Written up for submission to Automation in Construction.",
    category: "Computer Vision",
    tags: ["YOLOv9", "PyTorch", "Semi-Supervised", "OpenCV"],
    year: "2025",
    status: "Research, in submission",
    featured: true,
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/ppe-detection",
    // TODO(Kenny): replace with the real paper link when available
    paper: "#",
  },
  {
    title: "Bandar Tracker",
    blurb: "Smart-money flow tracker for the Indonesia Stock Exchange.",
    description:
      "Parses KSEI ownership data and broker summaries to surface accumulation and distribution by large players (bandarmologi). FastAPI + async SQLAlchemy backend, single-file charting frontend on Lightweight Charts.",
    category: "ML Systems",
    tags: ["FastAPI", "Async SQLAlchemy", "Pandas", "Data Pipeline"],
    year: "2025",
    status: "Active",
    featured: true,
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/bandar-tracker",
  },
  {
    title: "RAG Evaluation Harness",
    blurb: "Measure retrieval quality before trusting a RAG answer.",
    description:
      "A reproducible harness that scores retrieval-augmented pipelines with RAGAS, runs against local models through Ollama, and tracks faithfulness and context-recall across config changes so regressions are caught early.",
    category: "LLM / Agents",
    tags: ["LlamaIndex", "RAGAS", "Ollama", "Evaluation"],
    year: "2025",
    status: "Active",
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/rag-eval-harness",
  },
  {
    title: "Tiny Transformer From Scratch",
    blurb: "A 12M-param decoder-only transformer, no framework magic.",
    description:
      "A small decoder-only transformer trained on Indonesian Wikipedia. Built to actually understand the internals: tokenizer training, mixed precision, KV cache, and a minimal inference server.",
    category: "ML Systems",
    tags: ["PyTorch", "Transformers", "Tokenizers"],
    year: "2024",
    status: "Complete",
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/tiny-transformer",
  },
  {
    title: "Document Q&A Agent",
    blurb: "Ask questions across a folder of PDFs, get cited answers.",
    description:
      "A local-first retrieval agent over personal documents. Chunking and hybrid search with citations back to the source page, so answers are checkable instead of vibes.",
    category: "LLM / Agents",
    tags: ["LangChain", "FastAPI", "Hugging Face", "RAG"],
    year: "2025",
    status: "Active",
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/doc-qa-agent",
  },
];
```

- [ ] **Step 6: Write `src/data/skills.ts`**

```ts
import type { IconType } from "react-icons";
import {
  SiDocker,
  SiFastapi,
  SiGithubactions,
  SiGnubash,
  SiHuggingface,
  SiLangchain,
  SiLinux,
  SiLlamaindex,
  SiNumpy,
  SiOllama,
  SiOpencv,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiScikitlearn,
  SiTypescript,
  SiUbuntu,
  SiWeightsandbiases,
} from "react-icons/si";
import { FaDatabase } from "react-icons/fa6";
import { TbBrandCpp } from "react-icons/tb";

export type SkillCategory =
  | "Languages"
  | "ML / Deep Learning"
  | "LLM / Applied AI"
  | "Infra / MLOps";

export interface Skill {
  name: string;
  icon?: IconType;
}

export interface SkillGroup {
  category: SkillCategory;
  items: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: "Languages",
    items: [
      { name: "Python", icon: SiPython },
      { name: "TypeScript", icon: SiTypescript },
      { name: "C++", icon: TbBrandCpp },
      { name: "SQL", icon: FaDatabase },
      { name: "Bash", icon: SiGnubash },
    ],
  },
  {
    category: "ML / Deep Learning",
    items: [
      { name: "PyTorch", icon: SiPytorch },
      { name: "YOLOv9" },
      { name: "scikit-learn", icon: SiScikitlearn },
      { name: "OpenCV", icon: SiOpencv },
      { name: "Pandas", icon: SiPandas },
      { name: "NumPy", icon: SiNumpy },
    ],
  },
  {
    category: "LLM / Applied AI",
    items: [
      { name: "Hugging Face", icon: SiHuggingface },
      { name: "LangChain", icon: SiLangchain },
      { name: "LlamaIndex", icon: SiLlamaindex },
      { name: "Ollama", icon: SiOllama },
      { name: "FastAPI", icon: SiFastapi },
      { name: "RAGAS" },
    ],
  },
  {
    category: "Infra / MLOps",
    items: [
      { name: "Docker", icon: SiDocker },
      { name: "Linux", icon: SiLinux },
      { name: "GitHub Actions", icon: SiGithubactions },
      { name: "Weights & Biases", icon: SiWeightsandbiases },
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "Ubuntu", icon: SiUbuntu },
    ],
  },
];
```

(Reminder from Global Constraints: any `Si*`/`Tb*` import that doesn't exist in the installed react-icons — drop it and leave that skill's `icon` undefined.)

- [ ] **Step 7: Write `src/data/posts.ts`**

```ts
export interface Post {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
  href: string;
}

// Placeholder drafts — swap href to real post URLs when published.
export const posts: Post[] = [
  {
    title: "Pseudo-Labeling Made My PPE Detector Better, Then Worse",
    excerpt:
      "What confidence thresholds actually do to a YOLOv9 teacher-student loop, and how a bad threshold quietly poisons the next training round.",
    date: "2026-03-12",
    readTime: "8 min",
    tag: "Computer Vision",
    href: "#",
  },
  {
    title: "You Cannot Trust a RAG System You Have Not Measured",
    excerpt:
      "Setting up faithfulness and context-recall scoring with RAGAS so retrieval regressions show up as numbers, not user complaints.",
    date: "2026-01-28",
    readTime: "9 min",
    tag: "LLM / Applied AI",
    href: "#",
  },
  {
    title: "Reading Smart Money on the IDX",
    excerpt:
      "Turning KSEI ownership data into an accumulation signal, and why the cleaning step is most of the work in any real data project.",
    date: "2025-11-09",
    readTime: "7 min",
    tag: "ML Systems",
    href: "#",
  },
  {
    title: "Training a Tiny Transformer on One Consumer GPU",
    excerpt:
      "Notes on mixed precision, gradient checkpointing, and the small decisions that decide whether 12M parameters fit on a single card.",
    date: "2025-09-02",
    readTime: "6 min",
    tag: "ML Systems",
    href: "#",
  },
];
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run`
Expected: all tests pass (utils + data, 11 total). Then `npm run typecheck` — exits 0.

- [ ] **Step 9: Commit**

```bash
git add tests/unit/data.test.ts src/data
git commit -m "feat: add typed content data layer with integrity tests"
```

---

### Task 4: UI primitives (Reveal, Section, Tag, ButtonLink)

**Files:**
- Create: `src/components/ui/Reveal.tsx`, `src/components/ui/Section.tsx`, `src/components/ui/Tag.tsx`, `src/components/ui/ButtonLink.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`.
- Produces:
  - `Reveal({ children, delay?: number, className?: string })` — scroll-reveal wrapper (client component)
  - `Section({ id, eyebrow, title, children, className? })` — section shell with `aria-labelledby` and `<h2 id="{id}-heading">`
  - `Tag({ children })` — small pill
  - `ButtonLink({ href, variant?: "primary" | "quiet", external?: boolean, children, className? })` — pill link styled as button

- [ ] **Step 1: Write `src/components/ui/Reveal.tsx`**

```tsx
"use client";

import { motion } from "motion/react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px 0px" }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Write `src/components/ui/Section.tsx`**

```tsx
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Section({
  id,
  eyebrow,
  title,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-20 px-6 py-[clamp(4rem,2.5rem+5vw,8.5rem)]", className)}
    >
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <p className="text-sm font-semibold text-accent">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="mt-2 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
        </Reveal>
        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `src/components/ui/Tag.tsx`**

```tsx
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1 text-[13px] font-medium text-ink-muted">
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Write `src/components/ui/ButtonLink.tsx`**

```tsx
import { cn } from "@/lib/utils";

export function ButtonLink({
  href,
  variant = "primary",
  external = false,
  children,
  className,
}: {
  href: string;
  variant?: "primary" | "quiet";
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-[transform,background-color,color,box-shadow] duration-200 active:scale-[0.98]",
        variant === "primary" &&
          "bg-accent text-white shadow-soft hover:opacity-90",
        variant === "quiet" &&
          "border border-edge bg-raised text-ink shadow-soft hover:bg-surface-muted",
        className
      )}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build && npm run typecheck`
Expected: both exit 0 (components compile even though nothing renders them yet).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui
git commit -m "feat: add Reveal, Section, Tag, and ButtonLink primitives"
```

---

### Task 5: Theming and navigation (ThemeToggle, scroll-spy, Navbar, mobile menu)

**Files:**
- Create: `src/hooks/useActiveSection.ts`, `src/components/nav/ThemeToggle.tsx`, `src/components/nav/Navbar.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `navItems`, `sectionIds` from `@/data/nav`; `site` from `@/data/site`; `cn` from `@/lib/utils`.
- Produces: `Navbar()` (renders header + mobile menu + theme toggles), `ThemeToggle()` (has `data-testid="theme-toggle"`), `useActiveSection(ids: string[]): string | null`. Playwright later relies on: `nav[aria-label="Main"]`, `data-testid="theme-toggle"`, a link named `Resume` with `href="/resume.pdf"`.

- [ ] **Step 1: Write `src/hooks/useActiveSection.ts`**

```ts
"use client";

import { useEffect, useState } from "react";

// Pass a module-level constant (e.g. sectionIds) so the effect doesn't resubscribe.
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
```

- [ ] **Step 2: Write `src/components/nav/ThemeToggle.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={
        mounted
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
    >
      {mounted ? (
        isDark ? (
          <HiOutlineSun aria-hidden className="size-[18px]" />
        ) : (
          <HiOutlineMoon aria-hidden className="size-[18px]" />
        )
      ) : (
        <span aria-hidden className="size-[18px]" />
      )}
    </button>
  );
}
```

- [ ] **Step 3: Write `src/components/nav/Navbar.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { navItems, sectionIds } from "@/data/nav";
import { site } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const active = useActiveSection(sectionIds);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const glass = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "border-b transition-colors duration-300",
          glass
            ? "border-edge/70 bg-surface/75 backdrop-blur-xl"
            : "border-transparent"
        )}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6"
        >
          <a
            href="#top"
            className="text-[15px] font-semibold tracking-tight"
            onClick={() => setOpen(false)}
          >
            Kenny
          </a>

          {/* Desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                aria-current={active === item.id ? "true" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  active === item.id
                    ? "bg-surface-muted font-medium text-ink"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {item.label}
              </a>
            ))}
            <a
              href={site.resume}
              className="ml-1 rounded-full px-3.5 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Resume
            </a>
            <div className="ml-1">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="flex size-9 flex-col items-center justify-center gap-[5px] rounded-full text-ink"
            >
              <span
                aria-hidden
                className={cn(
                  "h-[1.5px] w-4 rounded-full bg-current transition-transform duration-200",
                  open && "translate-y-[3.25px] rotate-45"
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "h-[1.5px] w-4 rounded-full bg-current transition-transform duration-200",
                  open && "-translate-y-[3.25px] -rotate-45"
                )}
              />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 top-16 border-b border-edge bg-surface/95 backdrop-blur-xl md:hidden"
            >
              <div className="space-y-1 px-6 pb-8 pt-2">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-lg font-medium transition-colors hover:bg-surface-muted"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href={site.resume}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-lg font-medium text-ink-muted transition-colors hover:bg-surface-muted"
                >
                  Resume
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Wire into `src/app/page.tsx`** (replace file)

```tsx
import { Navbar } from "@/components/nav/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <div id="top" />
      </main>
    </>
  );
}
```

- [ ] **Step 5: Verify build and manual smoke**

Run: `npm run build && npm run typecheck && npm run lint`
Expected: all exit 0. Then `npm run dev`, open http://localhost:3000 — nav renders, theme toggle flips light/dark without a flash on reload, hamburger opens/closes at narrow width, Escape closes it. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/hooks src/components/nav src/app/page.tsx
git commit -m "feat: add glass navbar with scroll-spy, mobile menu, and theme toggle"
```

---

### Task 6: Hero section

**Files:**
- Create: `src/components/sections/Hero.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `site` from `@/data/site`; `ButtonLink`, `EASE_OUT` from `@/components/ui/*`.
- Produces: `Hero()` — contains the page's only `<h1>` and `id="top"` anchor. Playwright later expects the h1 to contain "machine learning systems" and the visible text "Open to AI Engineer roles".

- [ ] **Step 1: Write `src/components/sections/Hero.tsx`**

```tsx
"use client";

import { motion } from "motion/react";
import { site } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
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
        <motion.p variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-raised px-3.5 py-1.5 text-sm text-ink-muted shadow-soft">
            <span aria-hidden className="size-2 rounded-full bg-accent" />
            Open to AI Engineer roles
          </span>
        </motion.p>

        <motion.p
          variants={item}
          className="mt-10 text-sm font-semibold text-accent"
        >
          {site.name} · {site.role}
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-4 max-w-3xl text-balance text-[clamp(2.5rem,1.3rem+5.5vw,4.75rem)] font-semibold leading-[1.04] tracking-tight"
        >
          I build machine learning systems end to end.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted"
        >
          Computer vision and LLM tooling, from the training loop to the
          server that keeps it running.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="#work">See projects</ButtonLink>
          <ButtonLink href={site.socials.github} variant="quiet" external>
            GitHub <span aria-hidden>↗</span>
          </ButtonLink>
        </motion.div>

        <motion.dl
          variants={item}
          className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-edge pt-8 lg:grid-cols-4"
        >
          {site.status.map((entry) => (
            <div key={entry.label}>
              <dt className="text-sm text-ink-muted">{entry.label}</dt>
              <dd className="mt-1 text-[15px] font-medium">{entry.value}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `src/app/page.tsx`** — replace `<div id="top" />` inside `<main>`:

```tsx
import { Navbar } from "@/components/nav/Navbar";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
      </main>
    </>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build && npm run typecheck`
Expected: exit 0. `npm run dev`: hero staggers in on load; headline wraps cleanly at 320px; status grid is 2×2 on mobile, one row on desktop.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.tsx src/app/page.tsx
git commit -m "feat: add hero with status pill, display headline, CTAs, and status grid"
```

---

### Task 7: About and Skills sections

**Files:**
- Create: `src/components/sections/About.tsx`, `src/components/sections/Skills.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `about` from `@/data/site`; `skillGroups` from `@/data/skills`; `Section`, `Reveal` from `@/components/ui/*`.
- Produces: `About()` (`id="about"`), `Skills()` (`id="stack"`).

- [ ] **Step 1: Write `src/components/sections/About.tsx`**

```tsx
import { about } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="about" eyebrow="About" title="The unglamorous parts, done well.">
      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-muted">
          {about.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
        <div className="space-y-4">
          {about.facts.map((fact, i) => (
            <Reveal key={fact.title} delay={i * 0.08}>
              <div className="rounded-2xl border border-edge bg-raised p-6 shadow-soft">
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

- [ ] **Step 2: Write `src/components/sections/Skills.tsx`**

```tsx
import { skillGroups } from "@/data/skills";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Skills() {
  return (
    <Section id="stack" eyebrow="Stack" title="Tools I actually use.">
      <div className="grid gap-4 sm:grid-cols-2">
        {skillGroups.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.06} className="h-full">
            <div className="h-full rounded-2xl border border-edge bg-raised p-6 shadow-soft sm:p-7">
              <h3 className="text-[15px] font-semibold">{group.category}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map(({ name, icon: Icon }) => (
                  <li
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-sm text-ink-muted"
                  >
                    {Icon && <Icon aria-hidden className="size-3.5" />}
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Wire both into `src/app/page.tsx`** after `<Hero />`:

```tsx
import { Navbar } from "@/components/nav/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Skills />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run typecheck`
Expected: exit 0. Dev check: About prose + 3 fact cards (stacked right column on desktop, below prose on mobile); Skills is a 2×2 card grid on ≥640px, single column at 320px; icons render (missing ones simply absent).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/About.tsx src/components/sections/Skills.tsx src/app/page.tsx
git commit -m "feat: add about and skills sections"
```

---

### Task 8: Projects section with category filter

**Files:**
- Create: `src/components/sections/Projects.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `projects`, `categories`, `Project`, `ProjectCategory` from `@/data/projects`; `Section`, `Tag` from `@/components/ui/*`; `cn` from `@/lib/utils`.
- Produces: `Projects()` (`id="work"`). Playwright later relies on: filter pills as `role=button` named exactly `All`, `Computer Vision`, `LLM / Agents`, `ML Systems` with `aria-pressed`; each card is an `<article>` inside `#work`.

- [ ] **Step 1: Write `src/components/sections/Projects.tsx`**

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  categories,
  projects,
  type Project,
  type ProjectCategory,
} from "@/data/projects";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

type Filter = "All" | ProjectCategory;

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col rounded-[20px] border border-edge bg-raised p-6 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lifted sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
        <p className="text-sm text-ink-muted">
          {project.year} · {project.status}
        </p>
      </div>
      <p className="mt-3 text-[15px] font-medium text-accent">{project.blurb}</p>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        {project.description}
      </p>
      <div className="mt-auto pt-6">
        <ul className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-5 text-sm font-medium">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="text-ink-muted transition-colors hover:text-accent"
          >
            GitHub <span aria-hidden>↗</span>
          </a>
          {project.paper && (
            <a
              href={project.paper}
              className="text-ink-muted transition-colors hover:text-accent"
            >
              Paper <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <Section
      id="work"
      eyebrow="Work"
      title="A problem, an approach, an outcome."
    >
      <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
        {(["All", ...categories] as Filter[]).map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === category
                ? "bg-ink text-surface"
                : "bg-surface-muted text-ink-muted hover:text-ink"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <motion.ul layout className="mt-10 grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project) => (
            <motion.li
              layout
              key={project.title}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(project.featured && "sm:col-span-2")}
            >
              <ProjectCard project={project} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </Section>
  );
}
```

- [ ] **Step 2: Wire into `src/app/page.tsx`** — add `import { Projects } from "@/components/sections/Projects";` and `<Projects />` after `<Skills />`.

- [ ] **Step 3: Verify**

Run: `npm run build && npm run typecheck`
Expected: exit 0. Dev check: 5 cards (2 featured full-width rows); clicking "Computer Vision" leaves 1 card with a smooth transition; "All" restores 5; pills show pressed state; cards lift on hover.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Projects.tsx src/app/page.tsx
git commit -m "feat: add filterable projects section with featured layout"
```

---

### Task 9: Writing, Contact, and Footer sections

**Files:**
- Create: `src/components/sections/Writing.tsx`, `src/components/sections/Contact.tsx`, `src/components/sections/Footer.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `posts` from `@/data/posts`; `site`, `contact` from `@/data/site`; `formatDate` from `@/lib/utils`; `Section`, `Reveal`, `ButtonLink` from `@/components/ui/*`; icons `FaGithub`, `FaLinkedinIn`, `FaXTwitter` from `react-icons/fa6`.
- Produces: `Writing()` (`id="writing"`), `Contact()` (`id="contact"`), `Footer()`.

- [ ] **Step 1: Write `src/components/sections/Writing.tsx`**

```tsx
import { posts } from "@/data/posts";
import { formatDate } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Writing() {
  return (
    <Section
      id="writing"
      eyebrow="Writing"
      title="Notes in draft — coming soon."
    >
      <ul className="divide-y divide-edge border-y border-edge">
        {posts.map((post, i) => (
          <li key={post.title}>
            <Reveal delay={i * 0.05}>
              <div className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {post.title}
                    </h3>
                    <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                      Draft
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                    {post.excerpt}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-ink-muted">
                  {post.tag} · {formatDate(post.date)} · {post.readTime}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
```

- [ ] **Step 2: Write `src/components/sections/Contact.tsx`**

```tsx
import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { contact, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const socialLinks = [
  { label: "GitHub", href: site.socials.github, Icon: FaGithub },
  { label: "LinkedIn", href: site.socials.linkedin, Icon: FaLinkedinIn },
  { label: "X", href: site.socials.x, Icon: FaXTwitter },
];

export function Contact() {
  return (
    <Section id="contact" eyebrow="Contact" title="Let's talk.">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-lg leading-relaxed text-ink-muted">
            {contact.framing}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href={`mailto:${site.email}`}>{site.email}</ButtonLink>
            <ul className="flex gap-2">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex size-11 items-center justify-center rounded-full border border-edge bg-raised text-ink-muted shadow-soft transition-colors hover:text-ink"
                  >
                    <Icon aria-hidden className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
```

- [ ] **Step 3: Write `src/components/sections/Footer.tsx`**

```tsx
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-edge px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-ink-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name} · Tangerang, Indonesia
        </p>
        <a href="#top" className="transition-colors hover:text-ink">
          Back to top <span aria-hidden>↑</span>
        </a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Complete `src/app/page.tsx`** (final composition — replace file)

```tsx
import { Navbar } from "@/components/nav/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Writing } from "@/components/sections/Writing";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Writing />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npm run build && npm run typecheck && npm run lint && npm run test`
Expected: all exit 0. Dev check: full page scrolls through all seven sections; scroll-spy highlights follow; drafts show badges; mailto button works.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections src/app/page.tsx
git commit -m "feat: add writing, contact, and footer sections completing the page"
```

---

### Task 10: SEO assets (OG image, robots, sitemap, favicon)

**Files:**
- Create: `src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/icon.svg`

**Interfaces:**
- Consumes: `site` from `@/data/site` (sitemap URL).
- Produces: `/opengraph-image` (1200×630 PNG, auto-linked in metadata), `/robots.txt`, `/sitemap.xml`, favicon.

- [ ] **Step 1: Write `src/app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const alt = "Kenny — AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#0a0a0b",
          color: "#f5f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              backgroundColor: "#409cff",
            }}
          />
          <div style={{ fontSize: 28, color: "#a3a3ad" }}>kennyvws.dev</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4 }}>
            Kenny
          </div>
          <div style={{ marginTop: 12, fontSize: 36, color: "#a3a3ad" }}>
            AI Engineer — Computer Vision & LLM Systems
          </div>
        </div>
      </div>
    ),
    size
  );
}
```

- [ ] **Step 2: Write `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://kennyvws.dev/sitemap.xml",
  };
}
```

- [ ] **Step 3: Write `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, changeFrequency: "monthly", priority: 1 }];
}
```

- [ ] **Step 4: Write `src/app/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0066cc"/>
  <text x="32" y="43" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="600" fill="#ffffff" text-anchor="middle">K</text>
</svg>
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: exit 0; build output lists `/opengraph-image`, `/robots.txt`, `/sitemap.xml`, `/icon.svg` routes.

- [ ] **Step 6: Commit**

```bash
git add src/app/opengraph-image.tsx src/app/robots.ts src/app/sitemap.ts src/app/icon.svg
git commit -m "feat: add OG image, robots, sitemap, and favicon"
```

---

### Task 11: Playwright behavior tests and breakpoint screenshots

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`, `tests/e2e/screenshots.spec.ts`

**Interfaces:**
- Consumes: selectors produced by Tasks 5–9 (`nav[aria-label="Main"]`, `data-testid="theme-toggle"`, `#work article`, filter buttons by name, Resume link).
- Produces: `npm run e2e` green; `screenshots/{light,dark}-{320,768,1024,1440}.png` (gitignored) for visual QA in Task 12.

- [ ] **Step 1: Install Playwright browser**

Run: `npx playwright install chromium`
Expected: chromium downloads (or is already present).

- [ ] **Step 2: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

- [ ] **Step 3: Write `tests/e2e/smoke.spec.ts`**

```ts
import { expect, test } from "@playwright/test";

test("hero renders headline and availability pill", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "machine learning systems"
  );
  await expect(
    page.getByText("Open to AI Engineer roles").first()
  ).toBeVisible();
});

test("nav anchor scrolls to the work section", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Work" })
    .click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("#work")).toBeInViewport();
});

test("resume link points at the PDF", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Resume" }).first()
  ).toHaveAttribute("href", "/resume.pdf");
});

test.describe("theme", () => {
  test.use({ colorScheme: "light" });

  test("toggle switches to dark and persists across reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("theme-toggle").first().click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test("project filter narrows and restores the grid", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("#work article");
  await expect(cards).toHaveCount(5);
  await page.getByRole("button", { name: "Computer Vision" }).click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Semi-Supervised PPE Detection");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(cards).toHaveCount(5);
});
```

- [ ] **Step 4: Write `tests/e2e/screenshots.spec.ts`**

```ts
import { test } from "@playwright/test";

const widths = [320, 768, 1024, 1440];

// Scroll through the page so whileInView reveals fire before capturing.
async function revealAll(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });
    for (const width of widths) {
      test(`full page @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await revealAll(page);
        await page.screenshot({
          path: `screenshots/${theme}-${width}.png`,
          fullPage: true,
        });
      });
    }
  });
}
```

- [ ] **Step 5: Run the suite**

Run: `npm run e2e`
Expected: all smoke tests pass; 8 screenshots written to `screenshots/`. If the theme test fails because the first toggle resolves to light, the page started dark — the `colorScheme: "light"` fixture should prevent this; investigate rather than loosening the assertion.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/e2e
git commit -m "test: add Playwright smoke tests and breakpoint screenshot capture"
```

---

### Task 12: Visual QA, polish, README, final verification

**Files:**
- Create: `README.md`
- Modify: any component/CSS files that visual QA flags (polish only — no new features, no copy changes)

**Interfaces:**
- Consumes: `screenshots/*.png` from Task 11.
- Produces: the finished, verified site.

- [ ] **Step 1: Review all 8 screenshots**

Open each `screenshots/{theme}-{width}.png` and check against the spec's bar ("considered and crafted"): no horizontal overflow at 320px; hero headline scale feels confident, not cramped; card grids align; both themes look intentional (dark is not just inverted); contrast reads clearly; spacing rhythm is consistent between sections. Fix what fails, re-run `npm run e2e`, re-review. Repeat until clean.

- [ ] **Step 2: Reduced-motion and keyboard pass**

In a dev session: emulate `prefers-reduced-motion: reduce` (browser devtools) — no translate animations remain (opacity only). Tab through the page — skip link appears first, every link/button/pill shows a visible focus ring, mobile menu is reachable and Escape closes it.

- [ ] **Step 3: Write `README.md`**

```markdown
# kennyvws.dev

Personal portfolio — single page, Next.js App Router, Tailwind CSS v4,
Motion, next-themes. Design direction: Apple-HIG-inspired "Quiet Precision".

## Develop

    npm install
    npm run dev        # http://localhost:3000

## Verify

    npm run typecheck
    npm run lint
    npm run test       # Vitest — data integrity + utils
    npm run e2e        # Playwright — behavior + breakpoint screenshots
    npm run build

## Edit content

All copy lives in `src/data/` (site, nav, projects, skills, posts).
Layout code never contains copy — edit data files only.

## Deploy

Push to a Git remote and import into Vercel — zero extra config.
Domain: `kennyvws.dev`.

## TODO(Kenny)

- [ ] Add `public/resume.pdf`
- [ ] Confirm the five GitHub repo slugs in `src/data/projects.ts`
- [ ] Replace the PPE paper `#` link when published
- [ ] Verify the LinkedIn URL in `src/data/site.ts`
```

- [ ] **Step 4: Final verification suite**

Run: `npm run typecheck && npm run lint && npm run test && npm run e2e && npm run build`
Expected: everything green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: visual QA polish and README"
```

---

## Self-Review (completed)

- **Spec coverage:** all seven sections + nav (Tasks 5–9), theming (1, 5), motion + reduced-motion (1, 4, 6, 8), SEO/metadata (1, 10), data layer with TODO placeholders (3), a11y (1, 5, 12), verification (2, 3, 11, 12), README/deploy notes (12). No gaps found.
- **Placeholder scan:** the only TODOs are the intentional `TODO(Kenny)` content markers required by the spec.
- **Type consistency:** `cn`/`formatDate` (Task 2) match usage in 4–9; `EASE_OUT` exported in Task 4, imported in Task 6; data exports (Task 3) match imports in 5–10; `data-testid="theme-toggle"`, `nav[aria-label="Main"]`, `#work article`, and button names match between Tasks 5/8 and the Task 11 specs.
