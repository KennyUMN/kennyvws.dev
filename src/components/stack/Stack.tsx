import { skillGroups } from "@/data/skills";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Stack() {
  return (
    <Section id="stack" title="Stack">
      <div className="flex flex-col">
        {skillGroups.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.05}>
            <div className="grid gap-y-4 border-t border-rule py-7 sm:grid-cols-12 sm:gap-x-12">
              <h3 className="pt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-2 sm:col-span-3">
                {group.category}
              </h3>
              <ul className="flex flex-wrap gap-x-7 gap-y-3 sm:col-span-9">
                {group.items.map(({ name, icon: Icon }) => (
                  <li
                    key={name}
                    className="flex items-center gap-2.5 text-[clamp(1.35rem,1.1rem+0.9vw,2rem)] font-medium tracking-[-0.02em]"
                  >
                    {Icon && <Icon aria-hidden className="size-[0.7em] shrink-0 text-ink-3" />}
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
