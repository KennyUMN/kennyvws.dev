import { about } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function About() {
  const [lead, ...rest] = about.paragraphs;

  return (
    <Section id="about" title="About">
      <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
        <Reveal className="lg:col-span-8">
          <p className="text-balance text-[clamp(1.5rem,1.05rem+1.5vw,2.4rem)] font-medium leading-[1.2] tracking-[-0.022em]">
            {lead}
          </p>
        </Reveal>
        <div className="flex flex-col gap-5 text-lg leading-relaxed text-ink-2 lg:col-span-4 lg:pt-3">
          {rest.map((paragraph, i) => (
            <Reveal key={paragraph} delay={0.08 + i * 0.06}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
