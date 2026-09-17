"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { DUR_FAST, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** How far each corner retreats from the frame edge when `active`. */
const NUDGE = 3;

const CORNERS = [
  { key: "tl", cls: "left-0 top-0", border: "border-l border-t", x: -1, y: -1 },
  { key: "tr", cls: "right-0 top-0", border: "border-r border-t", x: 1, y: -1 },
  { key: "bl", cls: "bottom-0 left-0", border: "border-b border-l", x: -1, y: 1 },
  { key: "br", cls: "bottom-0 right-0", border: "border-b border-r", x: 1, y: 1 },
] as const;

interface ReticleProps {
  children: React.ReactNode;
  /** Small mono caption pinned above the frame, e.g. "FIG. 01". */
  label?: string;
  /** Pulls the corner ticks outward — the frame's one interaction tell.
   *  Defaults to the frame's own hover/focus state; pass a value only to
   *  drive it from outside. */
  active?: boolean;
  className?: string;
}

/** Annotation-tool viewfinder: four hairline corner ticks around any content.
 *  The repeating motif that ties hero, project artifacts, and closing together.
 *  The ticks retreat on hover or keyboard focus, so the frame answers the
 *  pointer the way a real viewfinder does. */
export function Reticle({
  children,
  label,
  active,
  className,
}: ReticleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const acquired = useInView(ref, { once: true, margin: "-64px 0px" });
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const reducedMotionValue = useReducedMotion();
  const reducedMotion = mounted && reducedMotionValue;
  const [hovered, setHovered] = useState(false);
  const isActive = active ?? hovered;
  const outward = !reducedMotion && (!acquired || isActive);
  const idle = mounted && !reducedMotion && acquired && !isActive;

  return (
    <div className={cn("relative", className)}>
      {label && (
        <p
          aria-hidden
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
        >
          {label}
        </p>
      )}
      <div
        ref={ref}
        className="relative"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {children}
        {CORNERS.map((corner) => (
          <motion.span
            key={corner.key}
            aria-hidden
            className={cn(
              "pointer-events-none absolute size-4 border-edge motion-reduce:!transform-none motion-reduce:!opacity-100",
              corner.cls
            )}
            initial={{ x: corner.x * NUDGE, y: corner.y * NUDGE, opacity: 0 }}
            animate={{
              x: outward ? corner.x * NUDGE : 0,
              y: outward ? corner.y * NUDGE : 0,
              opacity: reducedMotion || acquired ? 1 : 0,
            }}
            transition={reducedMotion ? { duration: 0 } : { duration: DUR_FAST, ease: EASE_OUT }}
          >
            <motion.span
              className={cn("absolute inset-0 border-edge motion-reduce:!transform-none", corner.border)}
              initial={false}
              animate={{ x: idle ? [0, corner.x, 0] : 0, y: idle ? [0, corner.y, 0] : 0 }}
              transition={idle ? { duration: 4, repeat: Infinity, delay: DUR_FAST, ease: "easeInOut" } : { duration: reducedMotion ? 0 : DUR_FAST }}
            />
          </motion.span>
        ))}
      </div>
    </div>
  );
}
