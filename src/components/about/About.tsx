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

      <dl className="mt-20 sm:mt-28">
        {about.facts.map((fact, i) => (
          <Reveal key={fact.title} delay={i * 0.06}>
            <div className="grid items-baseline gap-y-2 border-t border-rule py-7 sm:grid-cols-12 sm:gap-x-12">
              <dt className="font-wide text-[clamp(2rem,1.3rem+2.6vw,3.75rem)] font-extrabold leading-none tracking-[-0.035em] sm:col-span-6 lg:col-span-5">
                {fact.title}.
              </dt>
              <dd className="max-w-[48ch] text-lg leading-relaxed text-ink-2 sm:col-span-6 lg:col-span-5 lg:col-start-8">
                {fact.body}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
