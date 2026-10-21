import type { Project } from "@/data/projects";
import { ppeTraining } from "@/data/ppeTraining";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { AblationBars } from "./AblationBars";
import { ProjectMeta } from "./ProjectMeta";
import { TrainingCurve } from "./TrainingCurve";

export function CaseStudy({ project }: { project: Project }) {
  const { ablation, approach = [], metrics = [] } = project;
  const gain = ablation ? (ablation.rows[2].value - ablation.rows[1].value).toFixed(3) : null;

  return (
    <article className="border-t border-rule pt-8 sm:pt-10">
      <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
        <Reveal variant="heading" className="lg:col-span-7">
          <ProjectMeta project={project} />
          <h3 className="mt-5 text-balance text-[clamp(2.25rem,1.4rem+3vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
            {project.title}
          </h3>
          <p className="mt-5 max-w-[34ch] text-xl leading-snug text-ink-2 sm:text-2xl">{project.blurb}</p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col justify-end gap-5 lg:col-span-5">
          <p className="max-w-[56ch] leading-relaxed text-ink-2">{project.description}</p>
          <div className="flex flex-wrap gap-x-6 font-medium">
            {project.github && (
              <TextLink href={project.github} external resting>
                Code and training log
              </TextLink>
            )}
            {project.paper && (
              <TextLink href={project.paper} external resting>
                Manuscript
              </TextLink>
            )}
          </div>
        </Reveal>
      </div>

      <Reveal variant="artifact" className="mt-14 sm:mt-20 sm:pl-10">
        <TrainingCurve data={ppeTraining} source={project.metricsSource ?? ""} />
      </Reveal>

      {metrics.length > 0 && (
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-rule py-6 sm:grid-cols-4 sm:pl-10">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-2">{m.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-16 grid gap-y-14 sm:mt-20 lg:grid-cols-12 lg:gap-x-12">
        {ablation && gain && (
          <Reveal className="lg:col-span-6">
            <p className="text-[clamp(3.5rem,2.4rem+3.6vw,6rem)] font-semibold leading-none tracking-[-0.04em]">
              +{gain}
            </p>
            <p className="mt-3 max-w-[36ch] text-lg leading-snug text-ink-2">
              {ablation.metric} gained by pseudo-labeling, with the labeling budget held at 20%.
            </p>
            <div className="mt-10">
              <AblationBars ablation={ablation} />
            </div>
          </Reveal>
        )}
        {approach.length > 0 && (
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-2">How it works</h4>
            <ol className="mt-6 flex flex-col">
              {approach.map((step) => (
                <li key={step.title} className="grid gap-x-6 border-t border-rule py-5 first:border-t-0 first:pt-0 sm:grid-cols-[8rem_1fr]">
                  <p className="text-lg font-semibold">{step.title}</p>
                  <p className="leading-relaxed text-ink-2">{step.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        )}
      </div>
    </article>
  );
}
