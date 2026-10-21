# Critique 2: kennyvws.dev v2

Judged against the 3100 production build. I read every r6 and m4 screenshot, tiled under `critique2/`. I also probed the live page with Playwright (`critique2/pw/probe.mjs`, `critique2/pw/words.mjs`) and read both linked READMEs through `gh`.

## 1. Verdict

This is a disciplined, honest portfolio with two original pieces, the live Sobel headline and the diffusion halftone sign-off, and it is already better than most engineer sites a juror sees. It falls short of award level in the middle of the page. Seven blocks there share one skeleton and one spacing, the signature training curve finishes its scrub off-screen, and the copy retells the same 20% fact six times while calling a team course project "my current research".

## 2. Blockers

**B1. The lead project's framing is misleading.**
Region: the meta row in `light-1440-t1` at y≈220 reads "Research · manuscript available". The About lead in `light-1440-t4` at y≈740 reads "My current research teaches YOLOv9…".
The linked repo README opens with "Course project (Machine Learning final project, Kelompok 4)". A hiring manager who clicks "Code and training log" reads that line first, and the mismatch costs more trust than any visual flaw.
Fix: in `src/data/projects.ts`, set `status` to `"Team course project · manuscript public"`. In `src/data/site.ts`, drop "My current research" from the About lead (replacement in section 4). Kenny should confirm which parts he built. No source I read says so, so nothing on the page should imply sole authorship.

**B2. The training-curve scrub finishes off-screen on desktop.**
Measured at 1440x900 by stepping scroll progress p. At p=0.75 the readout's top is at y=69, just under the 64px nav. At p=1.0 the readout is at y=-151 and the plot top is at y=-117. The epoch-50 end marker sits about 112px below the plot top, so it fades in near y=-5, under the nav. Visible in `qa/m4/desktop-light-curve.png`: the curve is still drawing and its readout row is already gone. The one place where scroll means something completes where nobody can see it.
Fix: in `src/components/work/TrainingCurve.tsx`, change `offset: ["start 85%", "end 45%"]` to `offset: ["start 85%", "start 25%"]`. At 1440x900 the scrub then spans 540px of scroll and ends with the plot top at 225px, with the header and both markers in view. At 390 the 218px plot also ends fully visible. These end positions are derived from the measured geometry, not re-measured.

**B3. The x-axis reads "epoch 110" on phones.**
Region: the chart's bottom-left corner in `critique2/z-320-chart.png` and in `qa/m4/mobile-light-curve.png`. The "epoch 1" and "10" tick labels collide into one number.
Fix: in `TrainingCurve.tsx`, change the tick label `{i === 0 ? \`epoch ${epoch}\` : epoch}` to `{epoch}`. The header already says "mAP@50 by epoch".

**B4. The sign-off caption collides with its readout on phones.**
Region: the bottom of `qa/m4/mobile-light-signoff-end.png` and of `critique2/pw/iphone-bottom.png`. It reads "Forward process played backwards, cosine t = 0", with "schedule" wrapped onto a second line, so "cosine t = 0" looks like one phrase.
Fix: in `src/components/contact/Signoff.tsx`, add `gap-4 items-start` to the figcaption. Use the shorter caption in section 4.

**B5. The lens chips cover the headline on phones.**
Region: in `critique2/pw/iphone-after-tap.png` (iPhone 13 emulation, after one tap), the "Sobel 3×3" chip strikes through "ms, from" and "16.0% edge px" covers "aining loop". In `critique2/z-320-hero.png`, "32.4% edge px" covers "systems,". On a phone the window spans two of the six lines, so after a tap a third of the H1 sits under chips.
Fix: in `src/components/hero/SobelHeadline.tsx`, add `max-sm:hidden` to both chip spans. The corner ticks alone still read as an instrument window. The strip directly below already names the filter.

## 3. Top 6 improvements, ranked by leverage

**1. Make the training curve carry the claim.**
Today the curve has nothing to compare against. A skimmer cannot tell whether 0.614 is good, and the +0.128 claim lives about 450px lower in a separate figure.
- Draw the supervised-only baseline as a dashed `border-ink-3` rule across the plot. The value is 0.493, the row `CaseStudy.tsx` already finds as `baseline`; pass it in as a new `baseline` prop. Label it at the right end, above the line, where the curve runs well clear of it: "Supervised only, same 20% of labels: 0.493".
- Replace the top-right readout and the end `Marker` with one frontier label that rides the clip edge. Put it in an `absolute inset-0` wrapper moved by `transform: translate3d(${p*100}%, ${yPct}%, 0)`, so it stays compositor-only and the readout can never scroll away from the line it describes. With reduced motion it renders at p=1, on epoch 50.
- Delete the Precision / Recall / mAP@50-95 strip in `CaseStudy.tsx`. Move those three numbers into the figcaption line (copy in section 4). The tooltip and the table already carry them.

The result is that scrolling pushes the curve up through the bar it has to beat, so the signature piece tells the story itself. To stay honest, label the line as the ablation's single score. Never annotate the epoch where the curve crosses it, because the baseline is one number, not a training curve.

**2. Remove structure so the page has density contrast.**
Five project blocks share one skeleton: mono meta, display title, grey blurb, and a grey paragraph at column 7. About and Stack repeat the same label-left, content-right split, all at the same ~134px section padding. That is seven equal-weight blocks after the hero.
- Fold Stack into About as a compact `dl` in About's right column: the category label, then the items as one comma-separated line at 16 to 17px. Delete `Stack.tsx` and the Stack item in `nav.ts`.
- Render "Also built" in `WorkIndex.tsx` as a tight index of one row per project, roughly 72px tall: title, blurb, tags, year, and a link only when one exists.
- Drop the "No public repo yet" and "Private repository" lines. A missing link already says it. If the private status matters, move "Private" into the meta row.
- Kenny's open question from the decision log still stands. If RAG Evaluation Harness is FinRAG-ID's eval half, merge the two.

The page then reads as one loud case study followed by a fast scan. I guess the 1440 page drops from 7191px to about 5600px; I have not measured it.

**3. Fix the hero's first frame.**
At rest the window covers x 576 to 928, measured at 1440. "computer" ends at 630 and "vision and" spans 646 to 1011, so the first frame shows "compute", then the lensed "r vision a", then "nd". It splits the very words that name the specialization. This frame is also what every reduced-motion visitor keeps.
Fix in `SobelHeadline.tsx`:
- In `rasterize()`, set `g.rest.x = v.r.left - pr.left - STRIDE + g.lw / 2`.
- In `measure()`, widen the lens from `fs * 4.4` to `fs * 4.8`.

The window then frames "vision and" whole at 1440 (384px starting at 640) and at 390 (176px against a 168px phrase).

**4. State each fact once, and make About about Kenny.**
The 20% labeling budget appears in six prose sentences: hero strip, blurb, description, How it works, gain caption, and About lead. "The training log and the manuscript are public" appears twice. The eyebrow "AI Engineer · Computer Vision & LLM Systems" repeats the H1 one line below it, and the contact framing repeats the hero status word for word. To a juror, repetition reads as padding, and a skimmer only needs each fact once. Replacements are in section 4.

**5. Use one type system in the middle of the page.**
Wide extrabold is used for section headings, the FinRAG step titles, the slogan, the wordmark, and the mobile menu. Meanwhile PPE's "How it works" steps use 18px semibold at normal width, so the same concept (method steps) gets two treatments 400px apart. Generic labels like "About" and "Stack" carry the heaviest ink on the page.
- Reserve `font-wide` for the Work heading, the contact slogan, the wordmark, and the menu.
- Give `Section.tsx` a quiet variant that sets About's heading in the "How it works" mono label style.
- In `PipelineFeature.tsx`, set the FinRAG step titles in Mona Sans at normal width, weight 600, 20px.

The slogan lands harder as the only wide display line in the bottom half.

**6. Put Kenny's full name on the page.**
The surname appears only inside the LinkedIn and X URLs (`kenny-sembiring`, `kenny_sembiring`). The tab title and the OG card say "Kenny · AI Engineer". A recruiter who forwards the link or enters him into an ATS needs the full name.
Fix: add `fullName: "Kenny Sembiring"` to `site.ts` once Kenny confirms the spelling and wants it public. Use it in the nav wordmark, `<title>`, the OG title, and the hero eyebrow. Keep KENNY in the sign-off.

## 4. Copy

Every fact below comes from `src/data` or the two linked READMEs. Nothing here adds a number.

| Where | Current | Replacement | Fact source |
|---|---|---|---|
| Hero eyebrow, `site.role` | AI Engineer · Computer Vision & LLM Systems | Kenny Sembiring · AI engineer · Tangerang, Indonesia | role line, footer location, LinkedIn slug (name pending Kenny) |
| H1, `site.pitch` | …to the server that keeps it running. | I build computer vision and LLM systems, from the training loop to the server that keeps them running. | same words. "it" had no singular antecedent. Keeps "vision" for the lens rest |
| Hero CTA | See the work ↓ | See the work | drop the scroll-cue arrow |
| Strip, headline note (`Hero.tsx`) | A 3×3 Sobel filter, run in your browser over 0.41 M pixels in 15.2 ms. Point at the headline to slide the window. | Your browser just ran a 3×3 Sobel edge filter over this headline, 0.41 megapixels in 15.2 ms. Point at the words to move the window. | live stat. Change the format in `buildIntegral()` to `${mp} megapixels in ${ms} ms` |
| Strip, before the stat arrives | …over its rendered glyphs. | Your browser runs a 3×3 Sobel edge filter over this headline. | |
| Strip, touch hint | Tap the headline to open the filter window there. | Tap the words to move the window there. | |
| Strip label 2 | Selected work | Lead project | avoids repeating the section heading 200px below |
| Section heading | Selected work | Work | matches the nav. Five projects is not a selection |
| Section heading | Stack | (removed, folded into About as a mono label "Tools") | improvement 2 |
| PPE status | Research · manuscript available | Team course project · manuscript public | README: "Course project (Machine Learning final project, Kelompok 4)" |
| PPE blurb | Safety-gear detection with YOLOv9, hand-labeling only a fifth of the data. | Finds missing safety gear on construction sites, trained with hand labels on only 20% of the images. | projects.ts, README |
| PPE description | Finds hardhats, vests and missing gear… The training log and the manuscript are public. | Detects helmets and safety vests in construction-site footage, then marks each worker compliant or in violation. Trained on the public SH17 dataset. The 50-epoch training log and the manuscript are public. | README: helmet and safety vest are the shipped mandatory PPE, SH17 dataset, 50-epoch run |
| PPE chart caption, `metricsSource` | 20% labeled split · repo training log, epoch 50 | Repo training log, 20% labeled split. Epoch 50: precision 0.704, recall 0.573, mAP@50-95 0.409 | absorbs the deleted metric strip (improvement 1) |
| Chart baseline label (new) | | Supervised only, same 20% of labels: 0.493 | ablation row in projects.ts |
| PPE `gainCaption` | mAP@50 gained by pseudo-labeling at the best epoch, with the labeling budget held at 20%. | mAP@50 gained by pseudo-labeling at the best epoch, with the same hand labels. | the 20% stays visible in the bar labels |
| PPE `ablation.checkpoint` | The semi-supervised 0.621 matches the best epoch (40) of the training log above. The final epoch reads 0.614. | 0.621 is epoch 40, the best epoch of the log above. The run ends at 0.614 on epoch 50. | ppeTraining.ts |
| FinRAG description | Ask Indonesian annual reports… OpenRouter takes over when Ollama is down. | Ask an Indonesian annual report, prospectus or financial statement a question and get an answer that cites its pages. It runs local-first, and one Docker Compose command brings up Qdrant, Ollama, the API and the UI. | README: "local-first", docker-compose "qdrant + ollama + api + ui". The retrieval and fallback details stay in the four steps below, which already say them |
| FinRAG link | Code and evaluation | Code | the README's eval ships placeholder QA pairs and no published scores ("Replace eval/dataset.py with QA pairs…") |
| Tiny Transformer description | A small decoder-only transformer trained on Indonesian Wikipedia, covering… | Trained on Indonesian Wikipedia, with tokenizer training, mixed precision, a KV cache and a minimal inference server. | the blurb already says "decoder-only" |
| Also built, no-link lines | No public repo yet / Private repository | (removed; "Private" moves to the meta row if kept) | improvement 2 |
| About, paragraph 1 | I'm Kenny, a computer science student… every epoch of the training log are public. | I'm Kenny, a computer science student at Universitas Multimedia Nusantara in Tangerang, working toward AI engineering. I like the unglamorous parts of machine learning: cleaning the data, fighting the training run, getting a model to behave on a real server instead of a demo notebook. | site.ts paragraphs 1 and 2, footer location |
| About, paragraphs 2 and 3 | I like the unglamorous parts… / If a tool is interesting… | I build on a Mac and ship to a Linux homeserver with Docker, so everything has to work on both. If a tool is interesting and I can host it myself, I will. | site.ts |
| Contact framing (new `contact.invite`; the hero keeps `contact.framing`) | Open to AI Engineer roles, internships, and research collaborations. | Hiring an AI engineer or intern, or looking for a research collaborator? Write to me. | availability in site.ts |
| Sign-off caption | Forward process played backwards, cosine schedule | Cosine-schedule noise, rewound by scroll | Signoff.tsx: variance-preserving forward process, cosine schedule, t driven by scroll. Fits one line at 390 |
| `<title>`, OG title | Kenny · AI Engineer | Kenny Sembiring · AI Engineer | pending Kenny |

Kept as they are: the slogan, the status line, the lens chip text, "How it works", "Also built", the Bandar Tracker and RAG Evaluation Harness cards, the footer.

## 5. Nitpicks

1. The ablation bars use `rounded-r-[4px]` (computed `0px 4px 4px 0px`), which breaks the sharp-corners rule. Remove it in `AblationBars.tsx`.
2. The nav "Résumé" link keeps a permanent `link-rest` underline, so it always looks like the active section. `qa/m4/desktop-light-curve.png` shows two underlines. Remove `link-rest` from it in `Navbar.tsx`.
3. In dark mode the chart wash reads as a brown slab about 1344x520px (`dark-1440-t1`). Lower its top stop to about 0.08 in dark through a CSS variable.
4. Below lg, the email CTA stretches into a full-width orange bar with its arrow stranded mid-bar (`light-768-p3`, `pw/iphone-bottom.png`). Add `self-start` to that `ButtonLink` in `Contact.tsx`.
5. At -0.045em tracking the wide extrabold glyphs touch at 116px ("training", "data" in `light-1440-t6`). Loosen it to -0.035em in `Contact.tsx` and `Section.tsx`.
6. The live stat switches to bold Martian Mono mid-sentence and wraps as "0.18 M / pixels" at 768 (`light-768-p0`). Use `font-sans tabular-nums font-medium whitespace-nowrap` in `Hero.tsx`.
7. The case-study left edge jogs from 48px (header) to 88px (chart, metrics) and back to 48px (ablation) at 1440. Once the metric strip is gone, align the chart's figcaption with the header.
8. `skills.ts` files FastAPI under "LLM / Applied AI" and lists both Linux and Ubuntu. That is Kenny's data and his call.
