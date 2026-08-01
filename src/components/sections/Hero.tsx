"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { site } from "@/data/site";
import { TermPreview } from "@/components/ui/TermPreview";
import { Reticle } from "@/components/artifacts/Reticle";
import { DetectionFrame } from "@/components/artifacts/DetectionFrame";
import { reveal, staggerParent } from "@/lib/motion";

// Scroll-linked drift on the artifact plate only — a few dozen px and a
// fade toward the fold, inert entirely under reduced motion.
const PLATE_DRIFT_PX = 28;
const PLATE_MIN_OPACITY = 0.35;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const plateY = useTransform(scrollYProgress, [0, 1], [0, PLATE_DRIFT_PX]);
  const plateOpacity = useTransform(scrollYProgress, [0, 1], [1, PLATE_MIN_OPACITY]);

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Introduction"
      className="scroll-mt-24 px-6 pb-[clamp(4rem,2.5rem+4vw,7rem)] pt-32 sm:pt-40"
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
          className="mt-8 max-w-4xl text-balance text-[clamp(1.9rem,1rem+3vw,3.25rem)] font-semibold leading-[1.15] tracking-tight"
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

          <motion.div
            data-reveal
            variants={reveal("artifact")}
            style={reducedMotion ? undefined : { y: plateY, opacity: plateOpacity }}
            className="hidden w-full sm:block lg:w-[360px] lg:shrink-0"
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
