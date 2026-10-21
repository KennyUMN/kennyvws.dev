# Portfolio v2 critique

Screenshot paths below are absolute. Tiles are 1000px crops (1440 and 1024), 1400px crops (768) and 1600px crops (320) of the r3 full-page shots, saved in `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/`.

## 1. Verdict

This is clearly better than the old site, and it is not yet award-level. The old site decorated itself with illustrative detection boxes and section numbers, while this one proves the work with a real Sobel filter over the live headline and the real 50-epoch training log, but below the first case study it falls back to a standard editorial template whose section labels are louder than the pitch, and on phones some headings never appear and the lens hides the headline's key nouns.

## 2. Blockers

**B1. Headings that wrap to two lines never reveal on phones.**

Evidence. `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/qa/m1/mobile-light-signoff-end.png` and `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/qa/m1/mobile-dark-signoff-mid.png` show "Clean the data.", a blank band about 110px tall, then "Ship the server." A Playwright scroll-through with motion on left the affected spans stuck at translateY 77 to 85px. At 390px it is "Fight the training run." At 320px it is "Selected work" and all three sign-off lines, so a 320px visitor sees no sign-off headline at all. I reproduced it on a clean build of HEAD 623f773 and on the current working tree. The reduced-motion full-page shots cannot show it, because globals.css forces `[data-reveal]` to `transform: none`.

Cause. `whileInView` observes the inner span, which starts at y 105% of its own height inside an `overflow-hidden` wrapper with 0.06em of bottom padding. A one-line span keeps a sliver of about 0.5px inside the clip, so IntersectionObserver fires. A two-line span sits wholly outside the clip, never intersects, and never animates.

Fix. In `src/components/ui/Section.tsx` and `src/components/contact/Contact.tsx`, make the `overflow-hidden` wrapper the motion element that carries `initial="hidden"`, `whileInView="shown"` and `viewport`, and give the inner span `variants={{ hidden: { y: "105%" }, shown: { y: 0 } }}` with the existing transition. The wrapper is never clipped, so it always intersects.

**B2. The Document Q&A card contradicts the repo it links.**

Evidence. `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-1440-04.png`, top row. The card says "A local-first retrieval agent over personal documents" and tags "LangChain / FastAPI / Hugging Face / RAG". Its Code link opens KennyUMN/finrag-id. That README is titled "Indonesian Financial Document Q&A", lists LlamaIndex, Qdrant, BGE-M3 dense plus Sastrawi BM25 fused by RRF, Ollama with an OpenRouter fallback, RAGAS evaluation and Docker Compose, and its stack table says LlamaIndex was chosen as "lighter than LangChain". A reviewer who clicks Code finds the portfolio naming the framework the repo rejected. This is the only LLM project with public code, so it is the one most likely to be clicked.

Fix. Rewrite that entry in `src/data/projects.ts` from the README (title, blurb, description, and tags such as LlamaIndex, Qdrant, Ollama, RAGAS). Then ask Kenny whether "RAG Evaluation Harness" (RAGAS, Ollama, LlamaIndex, "No public repo yet") is a separate project or the eval half of finrag-id. If it is the same work, merge the two rows so the public link carries it.

**B3. On phones the parked lens covers "vision" and "systems".**

Evidence. `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/qa/m1/mobile-light-hero.png` at y 210 to 290, and a touch-emulated shot at `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/touch-hero.png`. After the intro the lens rests over "vision and / systems," and those words render only as thin accent outlines on a dot grid. A touch user has no hover to move it, so the first sentence a recruiter reads on a phone is "I build computer ... d LLM ... from the training loop". In light mode the accent (#ff5a1f) on the surface (#efefec) measures 2.71:1, under the 3:1 AA floor for large text, and the 1.5px strokes read weaker than that number. Desktop is acceptable because the glyphs are 92px and a pointer moves the lens.

Fix. In `src/components/hero/SobelHeadline.tsx` `finishIntro`, skip the `lens.style.opacity = "1"` step when `matchMedia("(pointer: coarse)")` matches, and set it in `aimAt` on the first pointerdown. Change the coarse-pointer hint in `src/components/hero/Hero.tsx` to say a tap shows the filter. The intro scan already demonstrates the idea on load, and the resting headline stays fully legible.

## 3. High-value improvements, ranked

1. **Make the pitch the loudest type on the page.** At 1440 the Section h2 clamp in `src/components/ui/Section.tsx` resolves to about 100px of 125%-wide extrabold, while the hero H1 is 92px at weight 560. "About" and "Stack", two filler labels, are the heaviest words on the site (`/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-1440-04.png`, `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-1440-05.png`). Cap the Section h2 near 4.5rem. The H1 and the sign-off then stay the only poster-scale type, and each lands harder.

2. **Delete the Training, Shipping and Writing rows.** The same idea appears three times in one scroll. About paragraph two says "cleaning the data, fighting the training run", the rows restate it, and the sign-off says it again in display type. "Writing." also claims write-ups the site never links (`src/data/posts.ts` is not rendered). Remove `about.facts` from `src/data/site.ts` and the `dl` from `src/components/about/About.tsx`. That cuts about 500px at 1440 and one unbacked claim.

3. **Give the LLM half of the role line a featured slot.** The role says "Computer Vision & LLM Systems", but the two featured slots are PPE (vision) and Bandar Tracker, whose description names no model, whose repo is private, and whose category reads "ML Systems". Feature the corrected finrag-id instead, using PipelineFeature with stages taken from its README (pdfplumber ingestion, BM25 plus BGE-M3 retrieval fused by RRF, Ollama generation with OpenRouter fallback, RAGAS evaluation). Move Bandar Tracker to Also built under an honest category added to `ProjectCategory` in `src/data/projects.ts`. Kenny also has public non-fork repos the site omits (lead-attn-ecg, molecular-gnn-ddi, umn-elearning-assistant) while two rows read "No public repo yet". He should decide whether any belong here, and any number must come from that repo's own results file.

4. **Stop uppercasing metric names.** `uppercase` turns "mAP@50" into "MAP@50" in the chart header, the metric labels and "MAP@50-95" (`/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-1440-01.png` at y 575, `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-1440-02.png` at y 285). To a vision reviewer MAP is a different acronym. The hero already uses sentence-case mono labels ("In this headline"), so drop `uppercase tracking-[0.08em]` in `TrainingCurve.tsx` (header), `CaseStudy.tsx` (dt and h4), `ProjectMeta.tsx`, `WorkIndex.tsx`, `PipelineFeature.tsx` and `Stack.tsx` (h3). The site then has one label style instead of two.

5. **Put every project's second column on one grid line.** At 1440 the description column starts at x 860 in the PPE case study, x 744 in Bandar Tracker and x 628 in the Also built rows (`/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-1440-01.png`, `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-1440-03.png`). Three left edges inside one section read as drift. Pick one start column (column 7 fits all three) and adjust the spans in `CaseStudy.tsx`, `PipelineFeature.tsx` and `WorkIndex.tsx`.

6. **Say each number once, and name the checkpoint.** In the case study 0.614 appears three times (readout, end marker, first metric cell), and the +0.128 claim appears twice within 250px (the caption under the big number and the AblationBars figcaption). Drop the mAP@50 cell from `metrics` in `projects.ts` and the first sentence of the figcaption in `AblationBars.tsx`, keeping the source line. The 0.621 behind +0.128 and the hero sentence is the epoch-40 peak, not the final 0.614 (the comment in `projects.ts` says so), so label which checkpoint each bar reports. An ML reader then sees the selection rule instead of discovering it.

7. **Strip the Stack icons and the duplicate entry.** Four items have no icon (YOLOv9, SQL, LlamaIndex, RAGAS), so the rows have a ragged rhythm, and 0.7em gray glyphs beside 30px words add noise without information (`/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-1440-06.png`). Ubuntu repeats Linux. Remove the `icon` fields and the react-icons import from `src/data/skills.ts` and the Icon branch in `Stack.tsx`. The typographic list then matches the rest of the page and the bundle drops a dependency.

8. **Make the sign-off caption true and keep the accent for results.** In `src/components/contact/Signoff.tsx` the caption says "Reverse diffusion, cosine schedule", but the code renders the closed-form forward marginal q(x_t | x_0) at a falling t with no denoiser. An ML reviewer reads "reverse diffusion" as a model running. Caption it "Forward process played backwards, cosine schedule". The plate also paints noise-dominated dots in the accent (`/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/qa/m1/desktop-light-signoff-mid.png`, bottom band), which breaks the globals.css rule that the accent marks results and "nothing decorative". Draw every dot in ink.

## 4. Nitpicks

- At 320px the sign-off readout breaks into "t =" and "0" (`/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-320-06.png`); add `whitespace-nowrap` to the readout span in `Signoff.tsx`.
- At 320px the case title leaves "Semi-" alone on a line (`/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-320-00.png`, bottom); lower the h3 clamp minimum in `CaseStudy.tsx` or use a non-breaking hyphen (U+2011) in the title.
- At 390px the hero eyebrow orphans "Systems" on its own line (`/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/qa/m1/mobile-light-hero.png`, top); add `text-balance` in `Hero.tsx`.
- On phones the chart hides every y-axis label while the axis starts at 0.3, which exaggerates the climb; keep the 0.3 and 0.7 labels (`max-sm:hidden` in `TrainingCurve.tsx`).
- Two near-identical outlined "Résumé" boxes share the first desktop viewport (nav and hero); make the nav one a plain text link in `Navbar.tsx`.
- At 1024px a wrapped status ("ACTIVE") drops to the left edge of the right-aligned meta column in Also built (`/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/critique/tiles/light-1024-03.png`); add `lg:justify-end` to ProjectMeta in that column.
- The lens label chips have an opaque surface background, so on a lower line they cut the descenders of the line above ("training loop" loses its g and p in `/private/tmp/claude-501/-Users-kennyvws-projects-kennyvws-dev/bde76bab-ac37-48f8-986b-4fe6d607f32b/scratchpad/qa/m1/mobile-light-lens.png`).
- The H1 sets in four lines at 1440 while the brief asks for about three; capping the hero clamp near 5rem gets three.

## 5. Strongest, do not touch

- The Sobel headline. It runs a real 3x3 convolution over the live DOM glyphs, reports its real cost in the caption ("0.60 M pixels in 11.3 ms"), keeps the h1 as text, and lands on a clean final state under reduced motion. It is specific to a vision engineer, and nobody else could claim it.
- The training curve. Scroll scrubs the real 50-epoch log, the peak and the final epoch are both annotated, hover shows all four metrics, and "View as table" gives the raw numbers.
- The ablation framing. "+0.128 mAP@50 with the labeling budget held at 20%" beside three bars states the research contribution in one look, and the four-step "How it works" list backs it.
- The hero fact strip. At 1440x900 the specialization, the best result with its numbers, and availability with the email all sit in the first viewport, which passes the 15-second skim.
- The type and color system. One family on its width axis plus Martian Mono, a warm off-white and near-black pair, and a dark theme that looks designed rather than inverted.
- The honesty labels. "Private repository", "No public repo yet" and a source line under every number. Keep them when projects change.

## Checked and not checked

Checked. Zero U+2013 or U+2014 characters in rendered text at 320, 390 and 1440 in both themes, no horizontal overflow at those widths, all text at least 4.5:1 against the page background in both themes, and `/resume.pdf` returns 200. B1 was confirmed on a clean build of HEAD 623f773 and on the working-tree build.

Not checked. Frame timing under CPU throttling, Safari and Firefox, keyboard focus order, and the résumé's contents.
