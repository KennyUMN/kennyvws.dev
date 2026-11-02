"use client";

import { useRef } from "react";
import { about } from "@/data/site";
import { skillGroups } from "@/data/skills";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { gsap, MOTION_OK, SplitText } from "@/lib/gsap";
import { useIdleGSAP } from "@/hooks/useIdleGSAP";
import { EASE_OUT, SETTLE } from "@/lib/motion";

export function About() {
  const [lead, ...rest] = about.paragraphs;
  const leadRef = useRef<HTMLParagraphElement>(null);
  const toolsRef = useRef<HTMLDListElement>(null);

  useIdleGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      // The lead rises line by line from behind its own mask, re-split if the layout reflows.
      const split = SplitText.create(leadRef.current, {
        type: "lines",
        mask: "lines",
        linesClass: "about-line",
        aria: "none",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 100,
            duration: 1,
            stagger: 0.08,
            ease: EASE_OUT,
            scrollTrigger: { trigger: leadRef.current, start: "top 80%", once: true },
          }),
      });

      // Each tool column draws its rule, then its label and tools follow in a short cascade.
      const columns = gsap.utils.toArray<HTMLElement>("[data-tools]", toolsRef.current);
      const tl = gsap.timeline({ scrollTrigger: { trigger: toolsRef.current, start: "top 82%", once: true } });
      columns.forEach((col, i) => {
        const at = i * 0.12;
        tl.from(col.querySelector("[data-rule]"), { scaleY: 0, duration: 0.8, ease: EASE_OUT, ...SETTLE }, at).from(
          col.querySelectorAll("dt, li"),
          { opacity: 0, y: 10, duration: 0.6, stagger: 0.04, ease: EASE_OUT, ...SETTLE },
          at + 0.1,
        );
      });

      return () => split.revert();
    });
  });

  return (
    <Section id="about" title="About" quiet>
      <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
        <p
          ref={leadRef}
          className="text-balance text-[clamp(1.5rem,1.05rem+1.5vw,2.4rem)] font-medium leading-[1.2] tracking-[-0.022em] lg:col-span-8"
        >
          {lead}
        </p>
        <div className="flex flex-col gap-5 text-lg leading-relaxed text-ink-2 lg:col-span-4 lg:pt-2">
          {rest.map((paragraph, i) => (
            <Reveal key={paragraph} delay={0.2 + i * 0.06}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-16 border-t border-rule pt-8 sm:mt-24">
        <h3 className="font-mono text-[12px] text-ink-2">Tools</h3>
        <dl ref={toolsRef} className="mt-6 grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {skillGroups.map((group) => (
            <div key={group.category} data-tools className="relative pl-4 pr-3 sm:pl-5 sm:pr-6">
              <dt className="font-mono text-[12px] text-ink-3">
                {/* The column rule lives in the dt, so the dl keeps only dt and dd children. */}
                <span aria-hidden data-rule data-reveal className="absolute inset-y-0 left-0 w-px origin-top bg-rule" />
                {group.category}
              </dt>
              <dd className="mt-3">
                <ul className="flex flex-col">
                  {group.items.map((item) => (
                    <li key={item} data-reveal className="py-0.5 text-[15px] leading-7 sm:text-[17px]">
                      {item}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
