"use client";

import { useState } from "react";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { ProjectMeta } from "./ProjectMeta";
import { Sketch } from "./Sketch";

export function WorkIndex({ projects }: { projects: Project[] }) {
  return (
    <div className="mt-24 sm:mt-32">
      <Reveal>
        <h3 className="font-mono text-[12px] text-ink-2">Also built</h3>
      </Reveal>
      <div className="mt-6">
        {projects.map((project, i) => (
          <Reveal key={project.title} delay={i * 0.06}>
            <IndexRow project={project} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// The row lights under the pointer: a soft ink spotlight and a brighter stretch of its top rule,
// both placed by CSS variables. Hover-capable screens only (Tailwind's hover variant).
const SPOTLIGHT =
  "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:[background:radial-gradient(520px_circle_at_var(--mx)_var(--my),color-mix(in_srgb,var(--ink)_5%,transparent),transparent_70%)]";

function IndexRow({ project }: { project: Project }) {
  const [active, setActive] = useState(false);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <article
      className={`group/row relative grid gap-y-4 border-t border-rule py-8 lg:grid-cols-12 lg:gap-x-12 ${SPOTLIGHT}`}
      onPointerMove={onPointerMove}
      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setActive(false)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px opacity-0 transition-opacity duration-300 group-hover/row:opacity-100 [background:radial-gradient(260px_circle_at_var(--mx)_0,var(--ink),transparent_70%)]"
      />
      <div className="relative lg:col-span-6">
        <ProjectMeta project={project} />
        <h4 className="mt-3 text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
          {project.title}
        </h4>
        <p className="mt-2 text-lg text-ink-2">{project.blurb}</p>
        {project.sketch && (
          <div className="mt-6">
            <Sketch kind={project.sketch} active={active} />
          </div>
        )}
      </div>
      <div className="relative flex flex-col gap-3 lg:col-span-6 lg:col-start-7">
        <p className="max-w-[56ch] leading-relaxed text-ink-2">{project.description}</p>
        <p className="font-mono text-[11px] text-ink-3">{project.tags.join(" / ")}</p>
        {project.github ? (
          <TextLink href={project.github} external className="self-start font-medium">
            Code
          </TextLink>
        ) : (
          <p className="font-mono text-[11px] text-ink-3">
            {project.privateRepo ? "Private repository" : "No public repo yet"}
          </p>
        )}
      </div>
    </article>
  );
}
