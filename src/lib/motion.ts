import type { Variants } from "motion/react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_SOFT = [0.22, 0.61, 0.36, 1] as const;

export const DUR_BASE = 0.6;
export const DUR_SLOW = 0.9;

export type RevealRole = "heading" | "body" | "artifact";

/** Role-specific entrances. Headings lift, body copy lifts, artifacts settle —
 *  so a section reads as a composition rather than one animation applied N times. */
export function reveal(role: RevealRole = "body", delay = 0): Variants {
  switch (role) {
    case "heading":
      return {
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR_SLOW, delay, ease: EASE_OUT },
        },
      };
    case "artifact":
      return {
        hidden: { opacity: 0, y: 14, scale: 0.985 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: DUR_SLOW, delay, ease: EASE_OUT_SOFT },
        },
      };
    default:
      return {
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR_BASE, delay, ease: EASE_OUT },
        },
      };
  }
}
