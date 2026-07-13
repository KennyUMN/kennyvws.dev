"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  categories,
  projects,
  type Project,
  type ProjectCategory,
} from "@/data/projects";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

type Filter = "All" | ProjectCategory;

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-edge bg-raised p-6 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lifted sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
        <p className="text-sm text-ink-muted">
          {project.year} · {project.status}
        </p>
      </div>
      <p className="mt-3 text-[15px] font-medium text-accent">{project.blurb}</p>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        {project.description}
      </p>
      <div className="mt-auto pt-6">
        <ul className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-5 text-sm font-medium">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="text-ink-muted transition-colors hover:text-accent"
          >
            GitHub <span aria-hidden>↗</span>
          </a>
          {project.paper && (
            <a
              href={project.paper}
              className="text-ink-muted transition-colors hover:text-accent"
            >
              Paper <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <Section id="work" title="A problem, an approach, an outcome.">
      <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
        {(["All", ...categories] as Filter[]).map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === category
                ? "bg-ink text-surface"
                : "bg-surface-muted text-ink-muted hover:text-ink"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <motion.ul layout className="mt-10 grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project) => (
            <motion.li
              layout
              key={project.title}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(project.featured && "sm:col-span-2")}
            >
              <ProjectCard project={project} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </Section>
  );
}
