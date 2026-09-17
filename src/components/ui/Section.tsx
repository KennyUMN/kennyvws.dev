"use client";

import { motion } from "motion/react";
import { DUR_BASE, DUR_FAST, EASE_OUT, staggerParent } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Section({
  id,
  title,
  index,
  children,
  className,
}: {
  id: string;
  title: string;
  /** 1-based section number for the instrument chrome (SEC. 0N). */
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-20 px-6 py-[clamp(4rem,2.5rem+5vw,8.5rem)]", className)}
    >
      <div className="mx-auto w-full max-w-5xl">
        <motion.div
          className="relative flex items-baseline justify-between gap-4 pb-4"
          variants={staggerParent(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-64px 0px" }}
        >
          <motion.h2
            id={`${id}-heading`}
            className="max-w-3xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: DUR_BASE, ease: EASE_OUT } },
            }}
          >
            {title}
          </motion.h2>
          <motion.span
            aria-hidden
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: DUR_FAST, delay: 0.06 } },
            }}
          >
            SEC. {String(index).padStart(2, "0")}
          </motion.span>
          <motion.span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-edge"
            variants={{
              hidden: { scaleX: 0 },
              show: { scaleX: 1, transition: { duration: DUR_BASE, ease: EASE_OUT, delay: 0.08 } },
            }}
          />
        </motion.div>
        <div className="mt-8 sm:mt-10">{children}</div>
      </div>
    </section>
  );
}
