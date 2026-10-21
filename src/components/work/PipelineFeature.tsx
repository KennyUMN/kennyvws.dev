"use client";

import { motion } from "motion/react";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { EASE_OUT } from "@/lib/motion";
import { ProjectMeta } from "./ProjectMeta";

export function PipelineFeature({ project }: { project: Project }) {
  const steps = project.approach ?? [];

  return (
    <article className="mt-24 border-t border-rule pt-8 sm:mt-32 sm:pt-10">
      <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
        <Reveal variant="heading" className="lg:col-span-5">
          <ProjectMeta project={project} />
          <h3 className="mt-5 text-[clamp(2.25rem,1.4rem+3vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
            {project.title}
          </h3>
          <p className="mt-5 max-w-[30ch] text-xl leading-snug text-ink-2 sm:text-2xl">{project.blurb}</p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col justify-end gap-4 lg:col-span-6 lg:col-start-7">
          <p className="max-w-[56ch] leading-relaxed text-ink-2">{project.description}</p>
          {!project.github && (
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">Private repository</p>
          )}
        </Reveal>
      </div>

      {steps.length > 0 && (
        <figure className="mt-14 sm:mt-20">
          <figcaption className="sr-only">How {project.title} moves data, in order</figcaption>
          <ol className="relative grid gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
            <motion.span
              aria-hidden
              data-reveal
              className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-ink lg:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.4, ease: EASE_OUT }}
            />
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                data-reveal
                className="relative flex flex-col gap-3 lg:pt-10"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, delay: 0.25 + i * 0.18, ease: EASE_OUT }}
              >
                <span aria-hidden className="absolute left-0 top-0 hidden size-[15px] border-2 border-ink bg-surface lg:block" />
                <p className="font-wide text-2xl font-bold tracking-[-0.02em]">{step.title}</p>
                <p className="max-w-[30ch] leading-relaxed text-ink-2">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </figure>
      )}

      <ul className="mt-12 flex flex-wrap gap-2" aria-label="Built with">
        {project.tags.map((tag) => (
          <li key={tag} className="border border-rule px-2.5 py-1 font-mono text-[11px] text-ink-2">
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}
