"use client";

import { useState } from "react";
import { projects } from "@/data/projects";
import { contact, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SobelHeadline } from "./SobelHeadline";

const lead = projects.find((p) => p.featured && p.ablation);

export function Hero() {
  const [stat, setStat] = useState<string | null>(null);

  return (
    <section id="top" aria-labelledby="hero-heading" className="flex min-h-[100dvh] flex-col pt-16">
      <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-rows-[1fr_auto] px-5 sm:px-8 lg:px-12">
        <div className="self-center py-12 sm:py-16">
          <p className="text-balance font-mono text-[12px] text-ink-2 sm:text-[13px]">{site.role}</p>
          <SobelHeadline
            id="hero-heading"
            text={site.pitch}
            onMeasured={setStat}
            className="mt-7 max-w-[17em] text-balance text-[clamp(2.3rem,0.75rem+5.2vw,5rem)] font-[560] leading-[1.02] tracking-[-0.032em]"
          />
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="#work" variant="ink">
              See the work
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">
                ↓
              </span>
            </ButtonLink>
            <ButtonLink href={site.resume} variant="outline">
              Résumé
            </ButtonLink>
          </div>
        </div>

        <dl className="grid gap-x-12 gap-y-6 border-t border-rule py-6 text-[15px] leading-relaxed text-ink-2 md:grid-cols-3">
          <div>
            <dt className="mb-1 font-mono text-[11px] text-ink-3">In this headline</dt>
            <dd>
              A 3×3 Sobel filter, run in your browser over{" "}
              <span className="font-mono text-[0.9em] tabular-nums text-ink">{stat ?? "its rendered glyphs"}</span>.{" "}
              <span className="pointer-coarse:hidden">Point at the headline to slide the window.</span>
              <span className="hidden pointer-coarse:inline">Tap the headline to open the filter window there.</span>
            </dd>
          </div>
          {lead?.ablation && (
            <div>
              <dt className="mb-1 font-mono text-[11px] text-ink-3">Selected work</dt>
              <dd>
                <span className="text-ink">{lead.title}.</span> {lead.ablation.claim}{" "}
                <a href="#work" className="font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
                  Read the case study
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="mb-1 font-mono text-[11px] text-ink-3">Status</dt>
            <dd className="flex gap-2.5">
              <span aria-hidden className="mt-[0.6em] size-2 shrink-0 rounded-full bg-accent" />
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
    </section>
  );
}
