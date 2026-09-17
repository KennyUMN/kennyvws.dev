"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TokenStreamProps {
  className?: string;
  caption?: string;
}

// Deterministic token widths (% of row width) per row — varied on purpose so
// the rows read as language, not a uniform loading skeleton. Rows stay well
// short of 100% so generation reads as mid-line, not a filled paragraph.
const ROWS: number[][] = [
  [14, 8, 20, 11, 16, 8],
  [9, 22, 12, 8, 14],
  [16, 10, 20, 9],
];

const TOKEN_STEP_S = 0.035;
const TOKEN_DURATION_S = 0.2;

// Flat token index each row starts at, so the stagger delay is a pure
// function of (rowIndex, i) rather than a counter mutated during render.
const ROW_START: number[] = ROWS.reduce<number[]>(
  (starts, row, i) => [...starts, (starts[i - 1] ?? 0) + (ROWS[i - 1]?.length ?? 0)],
  []
);
const TOTAL_TOKENS = ROWS.reduce((sum, row) => sum + row.length, 0);
const ENTRANCE_S = TOTAL_TOKENS * TOKEN_STEP_S + TOKEN_DURATION_S;

/** Rows of short bars standing in for streamed tokens, revealing
 *  left-to-right in a stagger once on scroll-into-view. The final row ends
 *  in a blinking caret; one deterministic token refreshes every five seconds. */
export function TokenStream({ className, caption }: TokenStreamProps) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const reducedMotionValue = useReducedMotion();
  const reducedMotion = mounted && reducedMotionValue;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex h-full w-full flex-col justify-center gap-3 overflow-hidden",
        caption && "px-4 pb-12",
        className
      )}
    >
      {ROWS.map((row, rowIndex) => {
        const isLastRow = rowIndex === ROWS.length - 1;
        return (
          <div key={rowIndex} className="flex items-center gap-1">
            {row.map((width, i) => {
              const delay = (ROW_START[rowIndex] + i) * TOKEN_STEP_S;
              return (
                <motion.span
                  key={i}
                  className="block h-2"
                  style={{ width: `${width}%` }}
                  initial={{ opacity: 0, x: -6 }}
                  animate={reducedMotion ? { opacity: 1, x: 0 } : undefined}
                  whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-64px 0px" }}
                  transition={reducedMotion ? { duration: 0 } : { duration: TOKEN_DURATION_S, ease: EASE_OUT, delay }}
                >
                  <motion.span
                    className="block h-full w-full bg-ink-muted/50"
                    initial={false}
                    whileInView={mounted && !reducedMotion && i === (rowIndex * 3 + 1) % row.length
                      ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
                    viewport={{ once: true, margin: "-64px 0px" }}
                    transition={mounted && !reducedMotion && i === (rowIndex * 3 + 1) % row.length ? {
                      duration: 0.4, repeat: Infinity, repeatDelay: ROWS.length * 5 - 0.4,
                      delay: ENTRANCE_S + (rowIndex + 1) * 5, ease: "easeInOut",
                    } : { duration: 0 }}
                  />
                </motion.span>
              );
            })}
            {isLastRow && (
              <motion.span
                className="block h-3 w-[3%]"
                initial={{ opacity: 0, x: -6 }}
                animate={reducedMotion ? { opacity: 1, x: 0 } : undefined}
                whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-64px 0px" }}
                transition={reducedMotion ? { duration: 0 } : {
                  duration: TOKEN_DURATION_S,
                  ease: EASE_OUT,
                  delay: TOTAL_TOKENS * TOKEN_STEP_S,
                }}
              >
                <motion.span
                  className="block h-full w-full bg-ink"
                  initial={false}
                  whileInView={mounted && !reducedMotion ? { opacity: [1, 0, 1] } : { opacity: 1 }}
                  viewport={{ once: true, margin: "-64px 0px" }}
                  transition={mounted && !reducedMotion ? {
                    duration: 1.1, repeat: Infinity, delay: ENTRANCE_S, ease: "easeInOut",
                  } : { duration: 0 }}
                />
              </motion.span>
            )}
          </div>
        );
      })}
      {caption && (
        <p className="absolute inset-x-4 bottom-3 font-mono text-[8.5px] uppercase tracking-[0.04em] text-ink-muted">
          {caption}
        </p>
      )}
    </div>
  );
}
