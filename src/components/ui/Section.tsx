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
          className="font-wide mb-12 text-[clamp(2.75rem,1.2rem+5.6vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.04em] sm:mb-16"
        >
          <span className="block overflow-hidden pb-[0.06em]">
            <m.span
              data-reveal
              className="block"
              initial={{ y: "105%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-80px 0px" }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              {title}
            </m.span>
          </span>
        </h2>
        {children}
      </div>
    </section>
  );
}
