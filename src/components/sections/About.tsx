import { about } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { TermPreview } from "@/components/ui/TermPreview";

const PIPELINE_PHRASE = "semi-supervised YOLOv9 pipeline";

function withPipelineTerm(paragraph: string): React.ReactNode {
  const index = paragraph.indexOf(PIPELINE_PHRASE);
  if (index === -1) return paragraph;
  return (
    <>
      {paragraph.slice(0, index)}
      <TermPreview term="yolo-pipeline">{PIPELINE_PHRASE}</TermPreview>
      {paragraph.slice(index + PIPELINE_PHRASE.length)}
    </>
  );
}

export function About() {
  return (
    <Section id="about" title="The unglamorous parts, done well.">
      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-muted">
          {about.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p>{withPipelineTerm(paragraph)}</p>
            </Reveal>
          ))}
        </div>
        <div className="space-y-8">
          {about.facts.map((fact, i) => (
            <Reveal key={fact.title} delay={i * 0.08}>
              <div className="border-t border-edge pt-6">
                <h3 className="text-[15px] font-semibold">{fact.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">
                  {fact.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
