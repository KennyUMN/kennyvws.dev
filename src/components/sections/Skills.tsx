import { skillGroups } from "@/data/skills";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Skills() {
  return (
    <Section id="stack" title="Tools I actually use." index={3}>
      <div className="grid grid-cols-2 gap-px border border-edge bg-edge lg:grid-cols-4">
        {skillGroups.map((group, i) => (
          <div key={group.category} className="h-full bg-surface p-5">
            <Reveal delay={i * 0.06} variant="body">
              <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                {group.category}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {group.items.map(({ name, icon: Icon }) => (
                  <li
                    key={name}
                    className="inline-flex items-center gap-1.5 text-[15px] text-ink-muted"
                  >
                    {Icon && <Icon aria-hidden className="size-3.5" />}
                    {name}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        ))}
      </div>
    </Section>
  );
}
