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
