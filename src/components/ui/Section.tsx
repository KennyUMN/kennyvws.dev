"use client";

import { useRef } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { useIdleGSAP } from "@/hooks/useIdleGSAP";
import { alreadyInView, EASE_OUT, SETTLE } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  title: string;
  /** A small label instead of the wide display heading, for sections led by their own copy. */
  quiet?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Section({ id, title, quiet, children, className }: SectionProps) {
  const clipRef = useRef<HTMLSpanElement>(null);

  useIdleGSAP(() => {
    if (!clipRef.current) return;
    gsap.matchMedia().add(MOTION_OK, () => {
      if (alreadyInView(clipRef.current!)) return;
      // The clip box is what gets observed: the offset child sits fully outside it until shown.
      gsap.from(clipRef.current!.firstElementChild, {
        yPercent: 105,
        duration: 0.9,
        ease: EASE_OUT,
        ...SETTLE,
        scrollTrigger: { trigger: clipRef.current, start: "top bottom-=80", once: true },
      });
    });
  });

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-16 py-[clamp(5rem,3rem+6vw,10rem)]", className)}
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {quiet ? (
          <h2 id={`${id}-heading`} className="mb-8 font-mono text-[12px] text-ink-2 sm:mb-10">
            {title}
          </h2>
        ) : (
          <h2
            id={`${id}-heading`}
            className="font-wide mb-12 text-[clamp(2.5rem,1.4rem+3.4vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em] sm:mb-16"
          >
            <span ref={clipRef} className="block overflow-hidden pb-[0.06em]">
              <span data-reveal className="block">
                {title}
              </span>
            </span>
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
