"use client";

import { motion } from "motion/react";
import { DUR_FAST, EASE_OUT, staggerParent } from "@/lib/motion";
import { projects } from "@/data/projects";
import { ProjectArtifact } from "@/components/artifacts/ProjectArtifact";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export function Projects() {
  return (
    <Section id="work" title="A problem, an approach, an outcome." index={1}>
      <ul className="divide-y divide-edge border-y border-edge">
        {projects.map((project, i) => (
          <li key={project.title}>
            <article className="py-8 sm:py-9 md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start md:gap-x-10">
              <div>
                <Reveal delay={i * 0.05}>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                    {project.category} · {project.year} · {project.status}
                  </p>
                  <div>
                    <h3
                      className={cn(
                        "font-semibold tracking-tight",
                        project.featured ? "text-2xl" : "text-xl"
                      )}
                    >
                      {project.title}
                    </h3>

                  </div>
                  <p className="mt-3 max-w-2xl text-[15px] font-medium">
                    {project.blurb}
                  </p>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                    {project.description}
                  </p>
                </Reveal>
                {project.metrics && project.metrics.length > 0 && (
                  <div>
                    <motion.dl
                      className="mt-4 flex divide-x divide-edge border border-edge"
                      variants={staggerParent(0.06)}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-64px 0px" }}
                    >
                      {project.metrics.map((m) => (
                        <div key={m.label} className="min-w-0 flex-1 px-3 py-2.5">
                          <dt className="break-words font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted">{m.label}</dt>
                          <motion.dd
                            className="font-mono text-base font-medium tabular-nums"
                            variants={{
                              hidden: { opacity: 0, y: 4 },
                              show: { opacity: 1, y: 0, transition: { duration: DUR_FAST, ease: EASE_OUT } },
                            }}
                          >
                            {m.value}
                          </motion.dd>
                        </div>
                      ))}
                    </motion.dl>
                    {project.metricsSource && (
                      <p className="mt-1.5 font-mono text-[11px] text-ink-muted">
                        {project.metricsSource}
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="border border-edge px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-5 text-ink-muted">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.1em]"
                      >
                        <span className="link-draw">GitHub</span>
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                    {project.paper && (
                      <a
                        href={project.paper}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.1em]"
                      >
                        <span className="link-draw">Paper</span>
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                </div>
              </div>
              <div className="mt-6 w-full md:mt-0 md:max-w-[320px] md:justify-self-end">
                <ProjectArtifact
                  category={project.category}
                  index={i}
                  title={project.title}
                  kind={project.artifactKind}
                  caption={project.artifactCaption}
                />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
