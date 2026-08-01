"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DUR_SLOW, EASE_OUT_SOFT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SignalTraceProps {
  className?: string;
  /** Two hand-authored curve shapes so repeated ML Systems rows don't read identically. */
  variant?: "smooth" | "noisy";
}

// Deterministic curve data in a 120x88 plot space — no Math.random(). Reads
// as a loss-over-step curve: starts high near the y-axis, settles low near
// the baseline without ever touching zero.
const CURVES = {
  smooth: {
    path: "M14,20 C36,28 52,44 68,54 C84,64 96,70 110,74",
    endY: 74,
  },
  noisy: {
    path: "M14,16 C26,24 32,20 42,32 C52,44 48,50 60,46 C72,42 78,54 88,60 C96,64 102,62 110,72",
    endY: 72,
  },
} as const;

const COMPARISON_PATH = "M14,30 C40,38 62,52 82,62 C94,68 104,72 110,74";
const GRID_Y = [30, 46, 62];

/** Abstract SVG line chart: a descending curve draws itself in once on
 *  scroll-into-view, then rests as a static plate. Colorless — ink/edge
 *  tokens only, themed automatically via currentColor + Tailwind utilities. */
export function SignalTrace({ className, variant = "smooth" }: SignalTraceProps) {
  // `useReducedMotion` reads matchMedia synchronously on the client but not
  // during SSR, so branching on it directly would render different pathLength
  // attributes server vs. client and trip a hydration mismatch. Gating behind
  // a mount flag (same pattern as TermPreview/ThemeToggle) keeps the first
  // client render identical to the server, then applies the real value once
  // mounted — before the element has scrolled into view.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const reducedMotionValue = useReducedMotion();
  const reducedMotion = mounted && reducedMotionValue;
  const curve = CURVES[variant];

  return (
    <div className={cn("relative h-full w-full", className)}>
      <svg
        viewBox="0 0 120 88"
        className="h-full w-full overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        {GRID_Y.map((y) => (
          <line
            key={y}
            x1={14}
            y1={y}
            x2={114}
            y2={y}
            className="stroke-edge"
            strokeWidth={1}
            opacity={0.6}
          />
        ))}
        <line x1={14} y1={14} x2={14} y2={76} className="stroke-edge" strokeWidth={1} />
        <line x1={14} y1={76} x2={114} y2={76} className="stroke-edge" strokeWidth={1} />

        <path
          d={COMPARISON_PATH}
          fill="none"
          className="stroke-ink-muted"
          strokeWidth={1}
          strokeLinecap="round"
          opacity={0.4}
        />

        <motion.path
          d={curve.path}
          fill="none"
          className="stroke-ink"
          strokeWidth={1.5}
          strokeLinecap="round"
          {...(reducedMotion
            ? {}
            : {
                initial: { pathLength: 0 },
                whileInView: { pathLength: 1 },
                viewport: { once: true, margin: "-64px 0px" },
                transition: { duration: DUR_SLOW, ease: EASE_OUT_SOFT },
              })}
        />

        <circle cx={110} cy={curve.endY} r={2} className="fill-ink" />
      </svg>

      <span className="pointer-events-none absolute left-0 top-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        loss
      </span>
      <span className="pointer-events-none absolute bottom-0 right-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        step
      </span>
    </div>
  );
}
