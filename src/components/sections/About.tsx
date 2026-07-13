import { about } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="about" title="The unglamorous parts, done well.">
      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-muted">
          {about.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
        <div className="space-y-4">
          {about.facts.map((fact, i) => (
            <Reveal key={fact.title} delay={i * 0.08}>
              <div className="rounded-2xl border border-edge bg-raised p-6 shadow-soft">
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
