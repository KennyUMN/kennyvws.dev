"use client";

import { useEffect, useRef } from "react";
import {
  CYCLE_MS,
  MAX_DPR,
  drawStaticFrame,
  readThemeColors,
  renderFrame,
} from "./detectionFrameDraw";

/** Canvas-rendered abstract detection diagram: fixed silhouettes with
 *  acquisition boxes that stagger in, hold, and release on an ~8s cycle.
 *  Colorless, theme-aware, and a single static frame under reduced motion. */
export function DetectionFrame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let colors = readThemeColors();
    let cssW = 0;
    let cssH = 0;
    let lastCycleT = 0;
    let rafId: number | null = null;
    let running = false;
    let visible = false;

    function render(cycleT: number) {
      if (cssW === 0 || cssH === 0) return;
      renderFrame(ctx!, cssW, cssH, colors, cycleT);
    }

    // Under reduced motion there's no cycleT to render from — paint the
    // fully-acquired static frame instead. Routing every repaint (resize,
    // theme change) through here — not just the initial one — matters
    // because ResizeObserver fires its own initial callback asynchronously
    // after observe() is called, i.e. after this effect's own first
    // resize()/paint() already ran; without this, that later async call
    // would fall through to render(0) and silently overwrite the static
    // frame with a mid-acquisition one.
    function paint() {
      if (cssW === 0 || cssH === 0) return;
      if (reduceMotion) {
        drawStaticFrame(ctx!, cssW, cssH, colors);
      } else {
        render(lastCycleT);
      }
    }

    function resize() {
      if (!canvas || !wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint();
    }

    function loop(now: number) {
      lastCycleT = (now % CYCLE_MS) / CYCLE_MS;
      render(lastCycleT);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function updateRunning() {
      if (reduceMotion) return;
      if (visible && !document.hidden) start();
      else stop();
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        updateRunning();
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(wrapper);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    document.addEventListener("visibilitychange", updateRunning);

    const themeObserver = new MutationObserver(() => {
      colors = readThemeColors();
      paint();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    resize();
    if (!reduceMotion) {
      updateRunning();
    }

    return () => {
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", updateRunning);
    };
  }, []);

  return (
    <div ref={wrapperRef} data-testid="detection-frame" className="h-full w-full">
      <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
    </div>
  );
}
