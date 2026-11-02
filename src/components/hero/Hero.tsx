"use client";

import { useState } from "react";
import { projects } from "@/data/projects";
import { contact, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { gsap, MOTION_OK, MOTION_REDUCE, useGSAP } from "@/lib/gsap";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { KERNELS, kernelById, type KernelId } from "./kernels";
import { SobelHeadline, type FilterRun } from "./SobelHeadline";

const lead = projects.find((p) => p.featured && p.ablation);

// The widest stat the sentence can carry, so its cell is sized before the measurement lands.
const STAT_SIZER = "00.00 megapixels in 000.0 ms";
const ran = (phrase: string, stat: string) => `Your browser just ran ${phrase} over this headline, ${stat}.`;

export function Hero() {
  const [kernel, setKernel] = useState<KernelId>("sobel");
  const [run, setRun] = useState<FilterRun | null>(null);

  // Entrance: nav, eyebrow, actions and the strip arrive around the headline, whose own entrance is
  // the filter scan. The headline itself never moves or hides: it is the largest paint, and the
  // filter reads its live layout.
  useGSAP(() => {
    const root = document.documentElement;
    const mm = gsap.matchMedia();
    mm.add(MOTION_REDUCE, () => root.classList.remove("intro"));
    mm.add(MOTION_OK, () => {
      const q = (name: string) => gsap.utils.toArray<HTMLElement>(`[data-intro="${name}"]`);
      const all = gsap.utils.toArray<HTMLElement>("[data-intro]");
      // Hand the hidden state from the pre-paint CSS to inline styles, then let the timeline run.
      gsap.set(all, { opacity: 0 });
      root.classList.remove("intro");
      gsap
        .timeline({ defaults: { ease: EASE_OUT, duration: 0.9 }, onComplete: () => gsap.set(all, { clearProps: "all" }) })
        .fromTo(q("nav"), { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
        .fromTo(q("eyebrow"), { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 0.15)
        .fromTo(q("actions"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.07 }, 0.55)
        .fromTo(q("rule"), { opacity: 1, scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 1.3 }, 0.6)
        .fromTo(q("strip"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.09 }, 0.8)
        .fromTo(q("ping"), { opacity: 0.55, scale: 1 }, { opacity: 0, scale: 3, duration: 1.4, ease: "power2.out", repeat: 1 }, 1.4);
    });
  });

  return (
    <section id="top" aria-labelledby="hero-heading" className="flex min-h-[100dvh] flex-col pt-16">
      <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-rows-[1fr_auto] px-5 sm:px-8 lg:px-12">
        <div className="self-center py-12 sm:py-16">
          <p data-intro="eyebrow" className="font-mono text-[12px] text-ink-2 sm:text-[13px]">
            {site.title} · {site.location}
          </p>
          <SobelHeadline
            id="hero-heading"
            text={site.pitch}
            kernel={kernel}
            onMeasured={setRun}
            className="mt-7 max-w-[17em] text-balance text-[clamp(2.3rem,0.75rem+5.2vw,5rem)] font-[560] leading-[1.02] tracking-[-0.032em]"
          />
          <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="#work" variant="ink" data-intro="actions">
                See the work
              </ButtonLink>
              <ButtonLink href={site.resume} variant="outline" data-intro="actions">
                Résumé
              </ButtonLink>
            </div>
            <KernelSwitch value={kernel} onChange={setKernel} />
          </div>
        </div>

        <div>
          <div aria-hidden data-intro="rule" className="h-px bg-rule" />
          <dl className="grid gap-x-12 gap-y-6 py-6 text-[15px] leading-relaxed text-ink-2 md:grid-cols-3">
            <div data-intro="strip">
              <dt className="mb-1 font-mono text-[11px] text-ink-3">In this headline</dt>
              {/* Every sentence the cell can show shares one grid area, so it keeps its height
                  when the stat arrives or the kernel changes. */}
              <dd className="grid">
                <span aria-hidden className="invisible [grid-area:1/1]">
                  Your browser runs a 3×3 Sobel edge filter over this headline. <Hint />
                </span>
                {KERNELS.map((k) => (
                  <span key={k.id} aria-hidden className="invisible [grid-area:1/1]">
                    {ran(k.phrase, STAT_SIZER)} <Hint />
                  </span>
                ))}
                <span aria-live="polite" className="[grid-area:1/1]">
                  {run ? (
                    <>
                      Your browser just ran {kernelById(run.kernel).phrase} over this headline,{" "}
                      <span className="whitespace-nowrap tabular-nums text-ink">{run.stat}</span>.
                    </>
                  ) : (
                    "Your browser runs a 3×3 Sobel edge filter over this headline."
                  )}{" "}
                  <Hint />
                </span>
              </dd>
            </div>
            {lead?.ablation && (
              <div data-intro="strip">
                <dt className="mb-1 font-mono text-[11px] text-ink-3">Lead project</dt>
                <dd>
                  <span className="text-ink">{lead.title}.</span> {lead.ablation.claim}{" "}
                  <a href="#work" className="font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
                    Read the case study
                  </a>
                </dd>
              </div>
            )}
            <div data-intro="strip">
              <dt className="mb-1 font-mono text-[11px] text-ink-3">Status</dt>
              <dd className="flex gap-2.5">
                <span aria-hidden className="relative mt-[0.6em] size-2 shrink-0">
                  <span data-intro="ping" className="absolute inset-0 rounded-full bg-accent opacity-0" />
                  <span className="absolute inset-0 rounded-full bg-accent" />
                </span>
                <span>
                  {contact.framing}{" "}
                  <a href={`mailto:${site.email}`} className="font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
                    {site.email}
                  </a>
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function KernelSwitch({ value, onChange }: { value: KernelId; onChange: (k: KernelId) => void }) {
  return (
    <div data-intro="actions" className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
      <span id="kernel-label" className="font-mono text-[11px] text-ink-3">
        Kernel
      </span>
      <div role="group" aria-labelledby="kernel-label" className="grid grid-cols-2 gap-px border border-rule bg-rule min-[360px]:grid-cols-4 sm:flex">
        {KERNELS.map((k) => (
          <button
            key={k.id}
            type="button"
            aria-pressed={value === k.id}
            onClick={() => onChange(k.id)}
            className={cn(
              "min-h-11 whitespace-nowrap px-1 font-mono text-[11px] transition-colors duration-200 sm:px-3 sm:text-[12px]",
              value === k.id ? "bg-ink text-surface" : "bg-surface text-ink-2 hover:bg-surface-raised hover:text-ink",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Hint() {
  return (
    <>
      <span className="pointer-coarse:hidden">Point at the words to move the window.</span>
      <span className="hidden pointer-coarse:inline">Tap the words to move the window there.</span>
    </>
  );
}
