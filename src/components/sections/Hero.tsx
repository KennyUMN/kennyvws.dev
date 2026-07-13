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
        <motion.p data-reveal variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-raised px-3.5 py-1.5 text-sm text-ink-muted shadow-soft">
            <span aria-hidden className="size-2 rounded-full bg-accent" />
            Open to AI Engineer roles
          </span>
        </motion.p>

        <motion.h1
          data-reveal
          variants={item}
          className="mt-8 max-w-4xl text-balance text-[clamp(2.5rem,1.2rem+4.5vw,4.25rem)] font-semibold leading-[1.04] tracking-tight"
        >
          I build machine learning systems end to end.
        </motion.h1>

        <motion.p
          data-reveal
          variants={item}
          className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted"
        >
          Computer vision and LLM tooling, from the training loop to the
          server that keeps it running.
        </motion.p>

        <motion.div data-reveal variants={item} className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="#work">See projects</ButtonLink>
          <ButtonLink href={site.socials.github} variant="quiet" external>
            GitHub <span aria-hidden>↗</span>
          </ButtonLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
