"use client";

import { useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { terms, type TermId } from "@/data/terms";
import { EASE_OUT } from "@/components/ui/Reveal";

const CURSOR_OFFSET_X = 14;
const CURSOR_OFFSET_Y = 20;
const CARD_MAX_WIDTH = 260;
const CARD_HEIGHT_ESTIMATE = 76;
const VIEWPORT_MARGIN = 12;
const SPRING = { stiffness: 400, damping: 40 };

function canHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function TermPreview({
  term,
  children,
}: {
  term: TermId;
  children: React.ReactNode;
}) {
  const { title, meta } = terms[term];
  const descriptionId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, SPRING);
  const springY = useSpring(rawY, SPRING);
  // Reduced motion: card sits where it opened, no cursor-lag tracking.
  const x = reducedMotion ? rawX : springX;
  const y = reducedMotion ? rawY : springY;

  const clampToViewport = (cx: number, cy: number) => ({
    x: Math.max(
      VIEWPORT_MARGIN,
      Math.min(cx, window.innerWidth - CARD_MAX_WIDTH - VIEWPORT_MARGIN)
    ),
    y: Math.max(
      VIEWPORT_MARGIN,
      Math.min(cy, window.innerHeight - CARD_HEIGHT_ESTIMATE - VIEWPORT_MARGIN)
    ),
  });

  const place = (cx: number, cy: number, immediate: boolean) => {
    const p = clampToViewport(cx, cy);
    if (immediate) {
      rawX.jump(p.x);
      rawY.jump(p.y);
      springX.jump(p.x);
      springY.jump(p.y);
    } else {
      rawX.set(p.x);
      rawY.set(p.y);
    }
  };

  return (
    <span
      ref={triggerRef}
      data-testid={`term-${term}`}
      className="term-trigger"
      tabIndex={0}
      aria-describedby={descriptionId}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        place(e.clientX + CURSOR_OFFSET_X, e.clientY + CURSOR_OFFSET_Y, true);
        setOpen(true);
      }}
      onPointerMove={(e) => {
        if (!open || e.pointerType !== "mouse") return;
        place(e.clientX + CURSOR_OFFSET_X, e.clientY + CURSOR_OFFSET_Y, false);
      }}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => {
        if (!canHover()) return;
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        place(rect.left, rect.bottom + 8, true);
        setOpen(true);
      }}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      {children}
      <span id={descriptionId} className="sr-only">
        {title} — {meta}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            data-testid="term-card"
            aria-hidden
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            style={{ x, y, maxWidth: CARD_MAX_WIDTH }}
            className="pointer-events-none fixed left-0 top-0 z-50 block rounded-xl border border-edge bg-raised px-4 py-3 text-left shadow-soft"
          >
            <span className="block text-sm font-semibold text-ink">{title}</span>
            <span className="mt-1 block text-[13px] leading-snug text-ink-muted">
              {meta}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
