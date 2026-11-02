"use client";

import { useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { gsap, MOTION_OK, ScrollTrigger } from "@/lib/gsap";
import { useIdleGSAP } from "@/hooks/useIdleGSAP";
import { EASE_OUT, SETTLE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ProjectMeta } from "./ProjectMeta";

const WIDE = "(min-width: 1024px)";
// One request crossing the four stages, then a breath before the next.
const PULSE_S = 2.6;
const PULSE_GAP_S = 0.9;

export function PipelineFeature({ project }: { project: Project }) {
  const steps = project.approach ?? [];
  const flowRef = useRef<HTMLOListElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hover ?? pinned;
  const stagesFor = (tag: string) => steps.filter((s) => s.uses?.includes(tag)).map((s) => s.title);

  useIdleGSAP(
    () => {
      const list = flowRef.current!;
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, wide: WIDE }, (ctx) => {
        const { motion, wide } = ctx.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;
        const axis = wide ? "x" : "y";
        gsap
          .timeline({ scrollTrigger: { trigger: list, start: "top 75%", once: true } })
          .from(`[data-rail-ink="${axis}"]`, { [wide ? "scaleX" : "scaleY"]: 0, duration: 1.4, ease: EASE_OUT, ...SETTLE })
          .from("[data-step]", { opacity: 0, y: 12, duration: 0.7, stagger: 0.18, ease: EASE_OUT, ...SETTLE }, 0.25);

        // A request pulse runs the rail and lights each stage's node as it arrives.
        const items = gsap.utils.toArray<HTMLElement>("[data-step]", list);
        const at = (el: HTMLElement) => (wide ? el.offsetLeft / list.offsetWidth : el.offsetTop / list.offsetHeight);
        const pulse = gsap.timeline({ repeat: -1, repeatDelay: PULSE_GAP_S, paused: true });
        pulse.fromTo(
          `[data-pulse="${axis}"]`,
          { [wide ? "xPercent" : "yPercent"]: 0 },
          { [wide ? "xPercent" : "yPercent"]: 100, duration: PULSE_S, ease: "none" },
          0,
        );
        items.forEach((item) => {
          const flash = item.querySelector("[data-flash]");
          pulse.fromTo(
            flash,
            { opacity: 1 },
            { opacity: 0, duration: 0.7, ease: "power2.out", immediateRender: false },
            at(item) * PULSE_S,
          );
        });
        ScrollTrigger.create({
          trigger: list,
          start: "top 90%",
          end: "bottom 10%",
          onToggle: (self) => (self.isActive ? pulse.play() : pulse.pause()),
        });
      });
    },
    flowRef,
  );

  return (
    <article className="mt-24 border-t border-rule pt-8 sm:mt-32 sm:pt-10">
      <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
        <Reveal variant="heading" className="lg:col-span-5">
          <ProjectMeta project={project} />
          <h3 className="mt-5 text-[clamp(1.8rem,1.2rem+3.2vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
            {project.title}
          </h3>
          <p className="mt-5 max-w-[30ch] text-xl leading-snug text-ink-2 sm:text-2xl">{project.blurb}</p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col justify-end gap-4 lg:col-span-6 lg:col-start-7">
          <p className="max-w-[56ch] leading-relaxed text-ink-2">{project.description}</p>
          {project.github ? (
            <TextLink href={project.github} external resting className="self-start font-medium">
              Code
            </TextLink>
          ) : (
            <p className="font-mono text-[11px] text-ink-3">
              {project.privateRepo ? "Private repository" : "No public repo yet"}
            </p>
          )}
        </Reveal>
      </div>

      {steps.length > 0 && (
        <figure className="mt-14 sm:mt-20">
          <figcaption className="sr-only">How {project.title} moves data, in order</figcaption>
          <ol ref={flowRef} className="relative grid gap-y-10 pl-10 lg:grid-cols-4 lg:gap-x-8 lg:pl-0">
            <Rail axis="x" />
            <Rail axis="y" />
            {steps.map((step) => {
              const state = !active ? "idle" : step.uses?.includes(active) ? "on" : "dim";
              return (
                <li
                  key={step.title}
                  data-step
                  data-state={state}
                  className="group/step relative flex flex-col gap-3 transition-opacity duration-300 data-[state=dim]:opacity-30 lg:pt-10"
                >
                  <span
                    aria-hidden
                    className="absolute -left-10 top-1 size-[15px] border-2 border-ink bg-surface transition-colors duration-200 group-data-[state=on]/step:bg-ink lg:left-0 lg:top-0"
                  >
                    <span data-flash className="absolute inset-0 bg-ink opacity-0" />
                  </span>
                  <p className="text-xl font-semibold">{step.title}</p>
                  <p className="max-w-[30ch] leading-relaxed text-ink-2">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </figure>
      )}

      <div className="mt-12">
        <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
          <span className="text-ink-2">Built with</span>
          <span className="text-ink-3 pointer-coarse:hidden">Point at a tool to see the stages it runs in</span>
          <span className="hidden text-ink-3 pointer-coarse:inline">Tap a tool to see the stages it runs in</span>
        </p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Built with">
          {project.tags.map((tag) => {
            const stages = stagesFor(tag);
            return (
              <li key={tag}>
                <button
                  type="button"
                  aria-pressed={pinned === tag}
                  onPointerEnter={(e) => e.pointerType !== "touch" && setHover(tag)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(tag)}
                  onBlur={() => setHover(null)}
                  onClick={() => setPinned((p) => (p === tag ? null : tag))}
                  className={cn(
                    "min-h-9 border px-2.5 font-mono text-[11px] transition-colors duration-200 pointer-coarse:min-h-11",
                    active === tag ? "border-ink bg-ink text-surface" : "border-rule text-ink-2 hover:border-ink hover:text-ink",
                  )}
                >
                  {tag}
                  {stages.length > 0 && <span className="sr-only">, used in {stages.join(", ")}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

// The rule under the stages, the ink line drawn over it on entry, and a clipped lane the request
// packet runs in. The lane is wider than the rule so the packet can sit centred on it.
const RAILS = {
  x: { line: "left-0 right-0 top-[7px] h-px max-lg:hidden", lane: "left-0 right-0 top-[5px] h-[5px] max-lg:hidden" },
  y: { line: "bottom-2 left-[7px] top-2 w-px lg:hidden", lane: "bottom-2 left-[5px] top-2 w-[5px] lg:hidden" },
};

function Rail({ axis }: { axis: "x" | "y" }) {
  const horizontal = axis === "x";
  return (
    <>
      <span aria-hidden className={cn("absolute bg-rule", RAILS[axis].line)} />
      <span
        aria-hidden
        data-rail-ink={axis}
        data-reveal
        className={cn("absolute bg-ink/50", horizontal ? "origin-left" : "origin-top", RAILS[axis].line)}
      />
      <span aria-hidden className={cn("absolute overflow-hidden", RAILS[axis].lane)}>
        <span data-pulse={axis} className="absolute inset-0 block">
          <span
            className={cn(
              "absolute block",
              horizontal ? "left-0 top-0 h-full w-28 -translate-x-full" : "left-0 top-0 h-28 w-full -translate-y-full",
            )}
          >
            <span
              className={cn(
                "absolute block from-transparent to-ink",
                horizontal
                  ? "inset-x-0 top-[2px] h-px bg-gradient-to-r"
                  : "inset-y-0 left-[2px] w-px bg-gradient-to-b",
              )}
            />
            <span className={cn("absolute block size-[5px] bg-ink", horizontal ? "right-0 top-0" : "bottom-0 left-0")} />
          </span>
        </span>
      </span>
    </>
  );
}
