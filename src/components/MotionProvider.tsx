"use client";

import { LazyMotion, MotionConfig } from "motion/react";

// The animation features load after hydration so they stay out of the first JS payload.
const loadFeatures = () => import("@/lib/motionFeatures").then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
