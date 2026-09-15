import { projects } from "@/data/projects";
import { ProjectArtifact } from "@/components/artifacts/ProjectArtifact";
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
              <article className="py-8 sm:py-9 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-start md:gap-x-10">
                <div>
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
                  {project.metrics && project.metrics.length > 0 && (
                    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-ink-muted">
                      {project.metrics.map((m) => (
                        <div key={m.label} className="flex items-baseline gap-1.5">
                          <dt className="uppercase tracking-[0.14em]">{m.label}</dt>
                          <dd className="tabular-nums font-medium text-ink">
                            {m.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-ink-muted">
                    <p>{[project.category, ...project.tags].join(" · ")}</p>
                    <span className="flex items-center gap-5">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center gap-1 font-medium transition-colors hover:text-ink"
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
                          className="inline-flex min-h-11 items-center gap-1 font-medium transition-colors hover:text-ink"
                        >
                          <span className="link-draw">Paper</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                    </span>
                  </div>
                </div>
                {/* Below sm the plate spans the row instead of sitting in the
                    right column — a narrow 220px plate next to full-width
                    copy reads as a thumbnail, not an artifact. */}
                <div className="mt-6 max-w-[220px] sm:block md:mt-0 md:justify-self-end">
                  <ProjectArtifact
                    category={project.category}
                    index={i}
                    title={project.title}
                  />
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
