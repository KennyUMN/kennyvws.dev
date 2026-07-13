import { skillGroups } from "@/data/skills";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Skills() {
  return (
    <Section id="stack" title="Tools I actually use.">
      <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {skillGroups.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.06}>
            <div className="border-t border-edge pt-6">
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
