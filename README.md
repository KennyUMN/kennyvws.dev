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
Structured content (projects, skills, posts, links, status) lives in the data files; section components hardcode only their display headlines.

## Deploy

Push to a Git remote and import into Vercel — zero extra config.
Domain: `kennyvws.dev`.

## TODO(Kenny)

- [ ] Add `public/resume.pdf`
- [ ] Confirm the five GitHub repo slugs in `src/data/projects.ts`
- [ ] Replace the PPE paper `#` link when published
- [ ] Verify the LinkedIn URL in `src/data/site.ts`
