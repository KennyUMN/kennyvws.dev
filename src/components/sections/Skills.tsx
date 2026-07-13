import { skillGroups } from "@/data/skills";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Skills() {
  return (
    <Section id="stack" eyebrow="Stack" title="Tools I actually use.">
      <div className="grid gap-4 sm:grid-cols-2">
        {skillGroups.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.06} className="h-full">
            <div className="h-full rounded-2xl border border-edge bg-raised p-6 shadow-soft sm:p-7">
              <h3 className="text-[15px] font-semibold">{group.category}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map(({ name, icon: Icon }) => (
                  <li
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-sm text-ink-muted"
                  >
                    {Icon && <Icon aria-hidden className="size-3.5" />}
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
