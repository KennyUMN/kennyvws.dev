"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, MOTION_REDUCE, ScrollTrigger } from "@/lib/gsap";

// Wait for layout to settle before re-measuring every scroll trigger.
const REFRESH_DEBOUNCE_MS = 200;

/**
 * Inertial wheel scrolling (Lenis) on GSAP's ticker, so smooth scroll and every ScrollTrigger read
 * the same frame. Touch keeps native scrolling, and reduced motion keeps the browser's own scroll.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia(MOTION_REDUCE);
    let lenis: Lenis | null = null;
    const tick = (time: number) => lenis?.raf(time * 1000);

    const start = () => {
      lenis = new Lenis({ autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
    };
    const stop = () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
    if (!reduce.matches) start();
    const onMotionChange = () => (reduce.matches ? stop() : start());
    reduce.addEventListener("change", onMotionChange);
    gsap.ticker.lagSmoothing(0);

    // Same-page anchors glide with Lenis. Keyboard activation (detail 0) keeps the native jump,
    // which also moves the focus starting point; the skip link always stays native.
    const onClick = (e: MouseEvent) => {
      if (!lenis || e.defaultPrevented || e.button !== 0 || e.detail === 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href^='#']");
      const hash = link?.getAttribute("href");
      if (!hash || hash === "#" || hash === "#main") return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { force: true });
      history.pushState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    // Content that changes height (the training table opening, fonts swapping) moves every trigger
    // below it, and ScrollTrigger only re-measures on window resize by itself.
    let refreshTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), REFRESH_DEBOUNCE_MS);
    });
    ro.observe(document.body);

    return () => {
      stop();
      reduce.removeEventListener("change", onMotionChange);
      document.removeEventListener("click", onClick);
      window.clearTimeout(refreshTimer);
      ro.disconnect();
    };
  }, []);

  return children;
}
