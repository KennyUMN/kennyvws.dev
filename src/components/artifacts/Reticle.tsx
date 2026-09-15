"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SPRING_SNAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** How far each corner retreats from the frame edge when `active`. */
const NUDGE = 3;

const CORNERS = [
  { key: "tl", cls: "left-0 top-0 border-l border-t", x: -1, y: -1 },
  { key: "tr", cls: "right-0 top-0 border-r border-t", x: 1, y: -1 },
  { key: "bl", cls: "bottom-0 left-0 border-b border-l", x: -1, y: 1 },
  { key: "br", cls: "bottom-0 right-0 border-b border-r", x: 1, y: 1 },
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
  const [hovered, setHovered] = useState(false);
  const isActive = active ?? hovered;

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
              "pointer-events-none absolute size-4 border-edge",
              corner.cls
            )}
            animate={{
              x: isActive ? corner.x * NUDGE : 0,
              y: isActive ? corner.y * NUDGE : 0,
            }}
            transition={SPRING_SNAP}
          />
        ))}
      </div>
    </div>
  );
}
