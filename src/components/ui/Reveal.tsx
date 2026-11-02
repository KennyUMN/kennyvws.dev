"use client";

import { useRef } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { useIdleGSAP } from "@/hooks/useIdleGSAP";
import { alreadyInView, REVEAL_FROM, SETTLE, type RevealRole } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  variant?: RevealRole;
  className?: string;
}

// Starts a little before the element reaches the viewport edge, like a 64px inset margin.
const START = "top bottom-=64";

export function Reveal({ children, delay = 0, variant = "body", className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        if (alreadyInView(ref.current!)) return;
        gsap.from(ref.current, {
          ...REVEAL_FROM[variant],
          ...SETTLE,
          delay,
          scrollTrigger: { trigger: ref.current, start: START, once: true },
        });
      });
    },
    ref,
  );

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}
