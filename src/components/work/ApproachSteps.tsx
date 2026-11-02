"use client";

import { useRef } from "react";
import type { Project } from "@/data/projects";
import { gsap, MOTION_OK, MOTION_REDUCE, ScrollTrigger } from "@/lib/gsap";
import { useIdleGSAP } from "@/hooks/useIdleGSAP";

type Step = NonNullable<Project["approach"]>[number];

/**
 * The method as an ordered rail. Scrolling draws the rail down through the steps and marks each
 * one as the line reaches its node, so the order of the work is read in the order it happened.
 */
export function ApproachSteps({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);

  useIdleGSAP(
    () => {
      const list = ref.current!;
      const items = gsap.utils.toArray<HTMLElement>("[data-step]", list);
      const fill = list.querySelector<HTMLElement>("[data-rail-fill]")!;
      const mark = (p: number) => {
        // A step is reached when the drawn rail passes its node, measured along the rail.
        const reach = p * list.offsetHeight;
        for (const item of items) item.dataset.active = String(item.offsetTop <= reach + 1);
      };
      const mm = gsap.matchMedia();
      mm.add(MOTION_REDUCE, () => {
        gsap.set(fill, { scaleY: 1 });
        mark(1);
      });
      mm.add(MOTION_OK, () => {
        gsap.set(fill, { scaleY: 0 });
        const trigger = ScrollTrigger.create({
          trigger: list,
          start: "top 70%",
          end: "bottom 55%",
          onUpdate: (self) => {
            gsap.set(fill, { scaleY: self.progress });
            mark(self.progress);
          },
        });
        gsap.set(fill, { scaleY: trigger.progress });
        mark(trigger.progress);
      });
    },
    ref,
  );

  return (
    <ol ref={ref} className="relative mt-6 flex flex-col">
      <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-rule" />
      <span aria-hidden data-rail-fill className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-ink" />
      {steps.map((step, i) => (
        <li
          key={step.title}
          data-step
          data-active="false"
          className="group/step relative grid gap-x-6 border-t border-rule py-5 pl-10 first:border-t-0 first:pt-0 sm:grid-cols-[9rem_1fr]"
        >
          <span
            aria-hidden
            className="absolute left-0 top-[1.55rem] size-[15px] border-2 border-ink bg-surface transition-colors duration-300 group-first/step:top-1 group-data-[active=true]/step:bg-ink"
          />
          <p className="text-lg font-semibold">
            <span className="mr-2 font-mono text-[12px] font-normal tabular-nums text-ink-3 transition-colors duration-300 group-data-[active=true]/step:text-ink">
              {String(i + 1).padStart(2, "0")}
            </span>
            {step.title}
          </p>
          <p className="leading-relaxed text-ink-2">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
