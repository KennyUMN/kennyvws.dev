export const EASE_OUT = "site-out";
export const EASE_SOFT = "site-soft";

export const DUR_BASE = 0.6;
export const DUR_SLOW = 0.9;

export type RevealRole = "heading" | "body" | "artifact";

/** Role-specific entrances. Headings lift, body copy lifts, artifacts settle,
 *  so a section reads as a composition rather than one animation applied N times. */
export const REVEAL_FROM: Record<RevealRole, gsap.TweenVars> = {
  heading: { opacity: 0, y: 12, duration: DUR_SLOW, ease: EASE_OUT },
  body: { opacity: 0, y: 16, duration: DUR_BASE, ease: EASE_OUT },
  artifact: { opacity: 0, y: 14, scale: 0.985, duration: DUR_SLOW, ease: EASE_SOFT },
};

/** Entrances hand the element back to its stylesheet once they finish. */
export const SETTLE = { clearProps: "transform,opacity" } as const;
