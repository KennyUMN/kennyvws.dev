"use client";

import { motion } from "motion/react";
import { site } from "@/data/site";
import { TermPreview } from "@/components/ui/TermPreview";
import { Reticle } from "@/components/artifacts/Reticle";
import { DetectionFrame } from "@/components/artifacts/DetectionFrame";
import { reveal, staggerParent } from "@/lib/motion";

export function Hero() {
  return (
    <section
      id="top"
      aria-label="Introduction"
      className="blueprint scroll-mt-24 px-6 pb-[clamp(4rem,2.5rem+4vw,7rem)] pt-28 sm:pt-32"
    >
      <motion.div
        variants={staggerParent(0.08)}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-5xl"
      >
        <motion.p
          data-reveal
          variants={reveal("body")}
          className="flex items-center gap-2 text-sm text-ink-muted"
        >
          <span aria-hidden className="size-2 rounded-full bg-accent" />
          Open to AI Engineer roles
        </motion.p>

        <motion.h1
          data-reveal
          variants={reveal("body")}
          className="mt-6 max-w-5xl text-balance text-[clamp(2.15rem,1.2rem+3.4vw,3.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]"
        >
          I build machine learning systems end to end:{" "}
          <TermPreview term="computer-vision">computer vision</TermPreview> and{" "}
          <TermPreview term="llm-tooling">LLM tooling</TermPreview>, from the
          training loop to{" "}
          <TermPreview term="the-server">the server</TermPreview> that keeps it
          running.
        </motion.h1>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <motion.div
            data-reveal
            variants={reveal("body")}
            className="flex flex-wrap items-center gap-x-8 gap-y-2"
          >
            <a
              href="#work"
              className="inline-flex min-h-12 items-center gap-1.5 text-lg font-medium"
            >
              <span className="link-draw link-rest">See projects</span>
              <span aria-hidden>→</span>
            </a>
            <a
              href={site.socials.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center gap-1.5 text-lg font-medium"
            >
              <span className="link-draw link-rest">GitHub</span>
              <span aria-hidden>↗</span>
            </a>
          </motion.div>

          <motion.div
            data-reveal
            variants={reveal("artifact")}
            className="w-full sm:w-auto lg:w-[400px] lg:shrink-0"
          >
            <Reticle label="FIG. 01 — DETECTION">
              <div className="aspect-[16/9] overflow-hidden bg-raised lg:aspect-[4/3]">
                <DetectionFrame />
              </div>
            </Reticle>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
