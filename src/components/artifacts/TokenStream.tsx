"use client";

import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TokenStreamProps {
  className?: string;
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

/** Rows of short bars standing in for streamed tokens, revealing
 *  left-to-right in a stagger once on scroll-into-view. The final row ends
 *  in a solid caret block — generation paused mid-stream, not a spinner. */
export function TokenStream({ className }: TokenStreamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full w-full flex-col justify-center gap-3 overflow-hidden",
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
                  className="block h-2 rounded-full bg-ink-muted/50"
                  style={{ width: `${width}%` }}
                  initial={{ opacity: 0, x: -6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-64px 0px" }}
                  transition={{ duration: TOKEN_DURATION_S, ease: EASE_OUT, delay }}
                />
              );
            })}
            {isLastRow && (
              <motion.span
                className="block h-3 w-[3%] rounded-sm bg-ink"
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-64px 0px" }}
                transition={{
                  duration: TOKEN_DURATION_S,
                  ease: EASE_OUT,
                  delay: TOTAL_TOKENS * TOKEN_STEP_S,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
