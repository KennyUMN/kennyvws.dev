import { about } from "@/data/site";
import { skillGroups } from "@/data/skills";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function About() {
  const [lead, ...rest] = about.paragraphs;

  return (
    <Section id="about" title="About" quiet>
      <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
        <Reveal className="lg:col-span-8">
          <p className="text-balance text-[clamp(1.5rem,1.05rem+1.5vw,2.4rem)] font-medium leading-[1.2] tracking-[-0.022em]">
            {lead}
          </p>
        </Reveal>
        <div className="flex flex-col gap-5 text-lg leading-relaxed text-ink-2 lg:col-span-4 lg:pt-2">
          {rest.map((paragraph, i) => (
            <Reveal key={paragraph} delay={0.08 + i * 0.06}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-16 border-t border-rule pt-8 sm:mt-24">
        <h3 className="font-mono text-[12px] text-ink-2">Tools</h3>
        <dl className="mt-6 grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group) => (
            <div key={group.category}>
              <dt className="font-mono text-[12px] text-ink-3">{group.category}</dt>
              <dd className="mt-2 text-lg leading-relaxed">{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
