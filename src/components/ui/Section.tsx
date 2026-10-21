"use client";

import { m } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ id, title, children, className }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-16 py-[clamp(5rem,3rem+6vw,10rem)]", className)}
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <h2
          id={`${id}-heading`}
          className="font-wide mb-12 text-[clamp(2.5rem,1.4rem+3.4vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] sm:mb-16"
        >
          {/* The clip box is what gets observed: the offset child sits fully outside it until shown. */}
          <m.span
            className="block overflow-hidden pb-[0.06em]"
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: "-80px 0px" }}
          >
            <m.span
              data-reveal
              className="block"
              variants={{ hidden: { y: "105%" }, shown: { y: 0 } }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              {title}
            </m.span>
          </m.span>
        </h2>
        {children}
      </div>
    </section>
  );
}
