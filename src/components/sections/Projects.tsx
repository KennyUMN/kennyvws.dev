import { projects } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export function Projects() {
  return (
    <Section id="work" title="A problem, an approach, an outcome.">
      <ul className="divide-y divide-edge border-y border-edge">
        {projects.map((project, i) => (
          <li key={project.title}>
            <Reveal delay={i * 0.05}>
              <article className="py-8 sm:py-9">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3
                    className={cn(
                      "font-semibold tracking-tight",
                      project.featured ? "text-2xl" : "text-xl"
                    )}
                  >
                    {project.title}
                  </h3>
                  <p className="text-sm text-ink-muted">
                    {project.year} · {project.status}
                  </p>
                </div>
                <p className="mt-3 max-w-2xl text-[15px] font-medium">
                  {project.blurb}
                </p>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-ink-muted">
                  <p>{[project.category, ...project.tags].join(" · ")}</p>
                  <span className="flex items-center gap-5">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-1 font-medium transition-colors hover:text-ink"
                    >
                      <span className="link-draw">GitHub</span>
                      <span aria-hidden>↗</span>
                    </a>
                    {project.paper && (
                      <a
                        href={project.paper}
                        className="inline-flex min-h-11 items-center gap-1 font-medium transition-colors hover:text-ink"
                      >
                        <span className="link-draw">Paper</span>
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                  </span>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
