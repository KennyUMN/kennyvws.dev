import { projects } from "@/data/projects";
import { Section } from "@/components/ui/Section";
import { CaseStudy } from "./CaseStudy";
import { PipelineFeature } from "./PipelineFeature";
import { WorkIndex } from "./WorkIndex";

export function Work() {
  const [lead, second] = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section id="work" title="Selected work">
      <CaseStudy project={lead} />
      <PipelineFeature project={second} />
      <WorkIndex projects={rest} />
    </Section>
  );
}
