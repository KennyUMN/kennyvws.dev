import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { ProjectMeta } from "./ProjectMeta";

export function WorkIndex({ projects }: { projects: Project[] }) {
  return (
    <div className="mt-24 sm:mt-32">
      <Reveal>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-2">Also built</h3>
      </Reveal>
      <div className="mt-6">
        {projects.map((project, i) => (
          <Reveal key={project.title} delay={i * 0.06}>
            <article className="grid gap-y-4 border-t border-rule py-8 lg:grid-cols-12 lg:gap-x-12">
              <div className="lg:col-span-5">
                <h4 className="text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
                  {project.title}
                </h4>
                <p className="mt-2 text-lg text-ink-2">{project.blurb}</p>
              </div>
              <p className="max-w-[56ch] leading-relaxed text-ink-2 lg:col-span-4">{project.description}</p>
              <div className="flex flex-col gap-3 lg:col-span-3 lg:items-end lg:text-right">
                <ProjectMeta project={project} />
                <p className="font-mono text-[11px] text-ink-3">{project.tags.join(" / ")}</p>
                {project.github ? (
                  <TextLink href={project.github} external className="font-medium">
                    Code
                  </TextLink>
                ) : (
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">No public repo yet</p>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
