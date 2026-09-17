# Engineer portfolios: evidence and recommendations

## Outcome

Keep Quiet Precision; make the work less generic, not the chrome louder. The strongest fit for Kenny is a calm reading surface plus verifiable research and deployed-system artifacts. These are qualitative patterns, not a statistical ranking or proof of hiring outcomes.

Scope: seven sites inspected through live browser DOM/computed styles (Rauno, Lee Robinson, Brian Lovin, Paco, Emil, shadcn, Antoine Wodniack); two AI practitioners read through page extraction (Chip Huyen, Eugene Yan); three Awwwards listings; one current Reddit discussion and one HN discussion. This is a September 2026 snapshot with dated 2024/2025 award references, not a historical reconstruction of every site's 2024 appearance.

## 10 concrete recurring patterns

1. **Identify the person and their actual work immediately.** Rauno's H1 is one biographical sentence; Brian says he is a software designer making AI products at Notion; shadcn names his AI-team role and products he created/co-created. The useful pattern is specificity, not a mandatory one-line layout.[1][3][6] For Kenny: computer vision, LLM systems, and deployment ownership beat “crafting intelligent experiences.”
2. **Use moderate type rather than making the name fill the screen.** At the inspected 1280px viewport, Rauno's H1 is 32px/500; Brian's name and introductory paragraph are 24px/32px/600; Paco's H1 is 16px. Large empty space is not the same as large lettering.[1][3][4]
3. **Give projects names and one functional description, then link to the real thing.** Paco lists cmdk, Writer, Next Themes with descriptions and direct GitHub links; Emil lists Sonner and Vaul with working product destinations; Brian's HN and App Dissection entries explain their purpose in one line.[3][4][5] Kenny should show a few consequential projects before any exhaustive skills inventory.
4. **Treat writing as technical evidence, not SEO filler.** Emil pairs component products with “Building a Toast Component” and “Building a Drawer Component”; Eugene's prototypes link to engineering articles such as semantic IDs, evaluation tooling, and recommender-system baselines; Lee puts Notes and Blogs directly on the home page.[2][5][10] For YOLOv9, show the question, baseline, experiment, failure cases, and what changed.
5. **Make the portfolio an index into a body of work.** Brian separates Writing and Projects; Paco separates Building, Projects, Writing, Now, Connect; Eugene separates selected prototypes and resources.[3][4][10] Readers can skim first and choose depth. Do not force every case study into one scrolling homepage.
6. **Create hierarchy with typography and grouping before decoration.** Paco uses Söhne (CSS family `Sohne`) with 14px section headings; shadcn uses Schibsted Grotesk, 16px project headings, and loaded JetBrains Mono; Brian uses Inter. Neither Inter nor plain lists are inherently slop.[3][4][6] The failure is unchosen, interchangeable hierarchy, not a particular font name.
7. **Use restrained surfaces, but do not pretend there is one mandatory palette.** Rauno was `#EDEDED`/`#000000`; Emil `#FDFDFC`/`#000000`; shadcn `#FFFFFF`/`#09090B`.[1][5][6] Paco responded to emulated system theme changes: light `#FFFFFF`/`#000000`, dark `#1A1A1A`/`#F2F2F2`.[4] These are measured page colors, not inferred brand palettes; no complete accessibility audit was performed.
8. **Make micro-motion acknowledge an action.** Emil's published examples specify `:active { scale: .97 }`, tooltip transform/opacity transitions of 125ms ease-out, zero duration for subsequent tooltips, entry scales above .9, and origin-aware popovers. He recommends UI motion generally under 300ms and removing repeatedly encountered flourishes.[7] This supports Kenny's underline affordances and term previews, not bounce-on-every-card choreography.
9. **Put unmistakably personal material beside professional evidence.** Chip's rice-farming-village childhood and storytelling coexist with production-AI work and tools; Paco includes his particular music tastes; Wodniack includes old desk setups, earlier portfolios, and personal photographs/captions.[4][9][16] Kenny's actual homeserver setup or candid deployment postmortem is more distinctive than a decorative fake terminal.
10. **Let spectacle demonstrate the skill being sold.** Wodniack sells animation-driven creative development; his Awwwards entry highlights intro animation, work gallery, 3D gallery, and About interactions. Federico Pian's 2024 award entry highlights project-list scrolling and the homepage gallery. Their motion is aligned with their services, not evidence that all engineers need WebGL.[11][12][16] For Kenny, an actual annotated detection example or controllable model comparison is the relevant equivalent.

## What hiring discussions actually support

There is no consensus that portfolios get read. In the April 2026 r/webdev thread, one participant reports a 15-30 second review for non-trivial scope; a self-described CTO says he checks every site and values succinctness, opinions, writeups, responsive design, and fundamentals; others say their hiring processes never inspect them. One practical comment recommends 2-4 focused projects, live demos, GitHub links, and clear roles. These are self-reported anecdotes, not verified identities or hiring statistics.[14]

The 2026 HN thread similarly splits: one commenter favors a hard-to-fake track record such as reviewed open-source contributions and production-grade projects; others emphasize credible employment history and explicitly reject requiring side projects. The sound takeaway is to make evidence easy to verify, not to promise that a portfolio replaces experience or a resume.[8]

Recommendation: optimize the first glance for specialization, two strongest pieces of work, and direct contact. Let the next click reveal role, constraints, decisions, evidence, code, and known limitations. For ML metrics, include dataset/split, baseline, hardware, and evaluation method where applicable; never substitute decorative precision for results.

## Five slop tells to avoid

These are design-review judgments informed by the references, not a measured frequency ranking or a detector of AI authorship.

1. **Interchangeable visual bundle:** purple-blue gradient text, glowing glass cards, identical rounded boxes, centered marketing hero. Any single technique can work; using the bundle without a project-specific reason is the tell. Brian's deliberate Inter and shadcn's neutral treatment demonstrate why banning fonts wholesale misses the point.[3][6]
2. **Copy with no falsifiable meaning:** “pushing boundaries,” “revolutionizing AI,” “seamless intelligent solutions.” Compare the named roles/products on shadcn and the concrete production-AI history on Chip's site.[6][9]
3. **Equal-weight project wallpaper:** every project gets the same icon, tags, screenshot frame, and two-line claim, regardless of significance. Prefer Paco's short purposeful index and Eugene's deeper linked prototype writeups.[4][10]
4. **Animation tax:** forced loaders, constant floating/bouncing, typewriter introductions, or repeated reveal sequences that make readers wait. Emil explicitly recommends speed and removing frequently repeated effects. Wodniack's more theatrical approach belongs to a different professional proposition.[7][16]
5. **Fake proof and borrowed personality:** invented uptime/accuracy counters, simulated logs presented as live, generic neural blobs, stock “AI brain” art, and badges without context. The better model is named tools, engineering narratives, and personal artifacts that only this owner could provide.[9][10][16]

## Three credible visual directions

Values marked “proposed” below are design specifications for Kenny, not claims about reference-site implementation.

### A. Quiet instrument panel (recommended evolution)

References: Rauno for the concise identity, Paco for the index, Emil for input-responsive detail.[1][4][7]

- Proposed light surface `#EDEDED`, ink `#111111`; dark `#1A1A1A`, ink `#F2F2F2`. Existing accent token remains unchanged and restricted to permitted locations.
- Keep the installed sans if it already reads well; proposed hero 32-40px, body 16-18px. Mono only for real model/hardware/measurement metadata.
- One real CV output or training plot near the relevant project, not a backdrop of generic detections. Borderless descriptions; shared Reticle frame only around meaningful artifacts.
- Proposed motion: 125-180ms underlines/previews, gentle active feedback, content visible without waiting. Keep the existing scroll-scrubbed training trace only because scroll has a defined meaning there.
- Distinction: calm surface, technically specific evidence. Lowest-risk change to the current architecture.

### B. Researcher's notebook

References: Lee Robinson's current serif site, Chip Huyen's personal production-AI narrative, Eugene Yan's prototypes and writeups.[2][9][10]

- Measured Lee stack: Iowan Old Style Local / Iowan Old Style / Palatino / Georgia; body 17px/27.2px, H1 42.4px/48.76px, dark background `#1B1A19`, text `#E8E5DF`.[2]
- Proposed light counterpart `#FAF9F6` with `#1B1A19` ink; comfortable 60-65ch reading measure; serif prose plus restrained mono captions. Keep accent rules unchanged.
- Present projects as compact research abstracts: problem, method, one result, limitation, then paper/code/deployment links. Include a real failure example rather than only a “best result.”
- Nearly static homepage; interaction concentrated in optional figure controls. No notebook/terminal cosplay.
- Distinction: the engineer as a careful investigator who also ships, rather than a landing-page character.

### C. Raw builder archive

References: Wodniack's personal history and project gallery, Federico Pian's work-led presentation, Paco's direct project links.[4][11][16]

- Wodniack's measured loaded families are Bigger Display, Editorial New, Fraktion Mono; measured body background `#F40C3F`, text `#160000`. These identify a genuinely different reference, **not** a palette to copy under Kenny's accent constraints.[16]
- Proposed adaptation: monochrome `#F2F2F2`/`#161616`, dark inverse, 1px structural rules, square artifact frames, a compact sans headline with mono metadata. Avoid importing licensed fonts just to imitate the reference.
- Lead with a real project artifact; use an archive/list of experiments, dated releases, deployment notes, and a homeserver photograph/diagram. Make research vs shipped vs retired status textual and honest.
- One deliberate transition or selectable before/after result, not Wodniack's full kinetic gallery. Preserve native scrolling and readable mobile flow.
- Distinction: raw authorship and operational receipts. Brutalism through exposed structure, not tiny illegible type or red paint.

## Non-negotiable implementation boundaries

- This is research, not authorization to redesign the codebase.
- Preserve the existing accent restriction: Contact email ButtonLink, hero status dot, focus-visible outline, selection only. No accent-colored project badges, charts, reticles, or new link colors.
- Keep motion-based link affordances, minimum 44px text-link hit areas, keyboard-accessible term previews, and user reduced-motion handling.
- Animate transform/opacity only; do not adopt Emil's optional blur suggestion because the repository's compositor-property constraint is stricter.
- Keep content in `src/data/`, and H1 exactly equal to `site.pitch`.
- Preserve the documented static reduced-motion rendering of SignalTrace. Do not replace it with the known-broken `motion.path pathLength: 1` fallback.
- Show real project evidence. Unpublished writing should not masquerade as a clickable published article; placeholder links need an honest draft state.

## Coverage limitations

`jason.af` produced a certificate warning and could not be studied. Several direct extractions were blocked; browser recovery worked for the primary comparison sites. CSSDA discovery failed, so no independent CSSDA award claim is made. Awwwards sources establish 2024/2025 recognition, not hiring effectiveness. Motion timing is sourced from Emil's published article, not invented from a screenshot. Theme emulation was conclusive for Paco; other theme behavior was not fully verified. No reliable design-Twitter thread was retrieved. No app files were modified.

## Sources

[1] https://rauno.me
[2] https://leerob.io
[3] https://www.brianlovin.com
[4] https://paco.me
[5] https://emilkowal.ski
[6] https://shadcn.com
[7] https://emilkowal.ski/ui/7-practical-animation-tips
[8] https://news.ycombinator.com/item?id=47409463
[9] https://huyenchip.com
[10] https://eugeneyan.com
[11] https://www.awwwards.com/sites/federico-pian-portfolio-2024
[12] https://www.awwwards.com/sites/aw-portfolio
[14] https://www.reddit.com/r/webdev/comments/1sf7jrm/what_do_hiring_managers_look_for_in_portfolio
[16] https://wodniack.dev
