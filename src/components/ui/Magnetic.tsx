"use client";

import { useRef } from "react";
import { FINE_POINTER, gsap, MOTION_OK } from "@/lib/gsap";
import { useIdleGSAP } from "@/hooks/useIdleGSAP";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: React.ReactNode;
  /** Share of the pointer's offset from the centre that the element follows. */
  strength?: number;
  className?: string;
}

/**
 * Pulls its child a little toward the pointer while hovered and springs back on leave.
 * Fine pointers with motion allowed only; the hit area stays the child's own.
 */
export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useIdleGSAP(
    () => {
      const el = ref.current!;
      gsap.matchMedia().add(`${MOTION_OK} and ${FINE_POINTER}`, () => {
        // Followers are rebuilt on each entry: the elastic return below kills them.
        let follow: { x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null = null;
        const onMove = (e: PointerEvent) => {
          if (!follow) {
            gsap.killTweensOf(el);
            follow = {
              x: gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" }),
              y: gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" }),
            };
          }
          const r = el.getBoundingClientRect();
          // Measure against the resting box, so the pull does not feed back into itself.
          const cx = r.left + r.width / 2 - Number(gsap.getProperty(el, "x"));
          const cy = r.top + r.height / 2 - Number(gsap.getProperty(el, "y"));
          follow.x((e.clientX - cx) * strength);
          follow.y((e.clientY - cy) * strength);
        };
        const onLeave = () => {
          gsap.killTweensOf(el);
          follow = null;
          gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          gsap.set(el, { clearProps: "transform" });
        };
      });
    },
    ref,
  );

  return (
    <span ref={ref} className={cn("inline-flex will-change-transform", className)}>
      {children}
    </span>
  );
}
