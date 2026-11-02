"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  gaussianBlur,
  kernelById,
  laplacianMagnitude,
  sobelMagnitude,
  summedArea,
  windowSum,
  type KernelId,
} from "./kernels";

// The lens rests on an 8px grid, like a strided window over a feature map.
const STRIDE = 8;
// |G| above a quarter of a full 0-to-255 step counts as an edge pixel.
const EDGE_T = 255;
// Maps |G| to alpha so strong glyph edges saturate.
const GAIN = 255 / 520;
// |Laplacian| above one full-step neighbour counts as an edge pixel; the gain saturates hard steps.
const LAP_T = 255;
const LAP_GAIN = 255 / 420;
// Blur radius per box pass as a share of the font size, so the softening reads at every width.
const BLUR_EM = 0.035;
// Lens spring: stiffness (1/s^2) and damping ratio. Under 1, so the window settles with a slight overshoot.
const SPRING_K = 320;
const SPRING_ZETA = 0.78;
const SPRING_C = 2 * SPRING_ZETA * Math.sqrt(SPRING_K);
const SPRING_STEP_S = 1 / 240;
const SWEEP_S = 0.5;

interface Geometry {
  W: number;
  H: number;
  dpr: number;
  fs: number;
  w: number;
  h: number;
  m: number;
  lw: number;
  lh: number;
  LH: number;
  lines: number;
  rest: { x: number; y: number };
}

export interface FilterRun {
  kernel: KernelId;
  /** The measured cost of the convolution, e.g. "0.41 megapixels in 9.9 ms". */
  stat: string;
}

interface SobelHeadlineProps {
  id: string;
  text: string;
  kernel: KernelId;
  className?: string;
  onMeasured?: (run: FilterRun) => void;
}

const TICKS = [
  "left-0 top-0 border-l-[1.5px] border-t-[1.5px]",
  "right-0 top-0 border-r-[1.5px] border-t-[1.5px]",
  "bottom-0 left-0 border-b-[1.5px] border-l-[1.5px]",
  "bottom-0 right-0 border-b-[1.5px] border-r-[1.5px]",
];

function readAccent(): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim().replace("#", "");
  const n = parseInt(hex.length === 3 ? hex.replace(/./g, "$&$&") : hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * The hero headline, with real convolutions computed over its own rendered glyphs.
 * An intro scan runs a 3x3 Sobel filter left to right, then a lens follows the pointer on a spring
 * and reports what the selected kernel measures under it. The h1 stays plain text; everything
 * drawn is aria-hidden.
 */
export function SobelHeadline({ id, text, kernel, className, onMeasured }: SobelHeadlineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const lensScanRef = useRef<HTMLDivElement>(null);
  const densityRef = useRef<HTMLSpanElement>(null);
  const measuredRef = useRef(onMeasured);
  const kernelRef = useRef(kernel);
  const apiRef = useRef<{ setKernel: (k: KernelId) => void } | null>(null);
  const reduce = useReducedMotion();
  const info = kernelById(kernel);

  useEffect(() => {
    measuredRef.current = onMeasured;
  }, [onMeasured]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const h1 = h1Ref.current;
    const plate = plateRef.current;
    const band = bandRef.current;
    const scan = scanRef.current;
    const lens = lensRef.current;
    const view = viewRef.current;
    const lensScan = lensScanRef.current;
    const densityEl = densityRef.current;
    if (!wrap || !h1 || !plate || !band || !scan || !lens || !view || !lensScan || !densityEl) return;

    const canvas = document.createElement("canvas");
    canvas.className = "absolute left-0 top-0 will-change-transform";
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    let G: Geometry;
    let A: Uint8Array;
    let M: Uint16Array;
    let L: Uint16Array | null = null;
    let B: Uint8Array | null = null;
    let tmp: Uint8Array | null = null;
    let weights: Uint8Array;
    let img: ImageData;
    let out: Uint8ClampedArray;
    let ctxOut: CanvasRenderingContext2D;
    let integral: Uint32Array | null = null;
    let integralScale = 1;
    let computedTo = 1;
    let sobelMs = 0;
    let sobelReady = false;
    let phase: "idle" | "intro" | "live" = "idle";
    let intro: gsap.core.Tween | null = null;
    let sweep: gsap.core.Tween | null = null;
    let ghost: HTMLCanvasElement | null = null;
    let raf = 0;
    let last = 0;
    let visible = true;
    let shown = "";
    // On touch screens there is no hover to move the lens off the words, so it waits for a tap.
    let lensOn = !window.matchMedia("(pointer: coarse)").matches;
    let disposed = false;
    const pos = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 };

    function measure(): Geometry {
      const r = h1!.getBoundingClientRect();
      const cs = getComputedStyle(h1!);
      const fs = parseFloat(cs.fontSize);
      const LH = parseFloat(cs.lineHeight);
      const m = Math.ceil(fs * 0.3);
      const w = Math.ceil(r.width) + 2 * m;
      const h = Math.ceil(r.height) + 2 * m;
      Object.assign(plate!.style, { left: `${-m}px`, top: `${-m}px`, width: `${w}px`, height: `${h}px` });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const lines = Math.max(1, Math.round(r.height / LH));
      const lw = Math.min(Math.round((fs * 4.8) / STRIDE) * STRIDE, Math.floor((r.width * 0.55) / STRIDE) * STRIDE);
      const lh = LH * Math.min(2, lines);
      return { W: Math.round(w * dpr), H: Math.round(h * dpr), dpr, fs, w, h, m, lw, lh, LH, lines, rest: { x: 0, y: 0 } };
    }

    // Draw the live DOM headline word by word at the positions the layout engine chose.
    function rasterize(g: Geometry): Uint8Array {
      const pr = plate!.getBoundingClientRect();
      const c = document.createElement("canvas");
      c.width = g.W;
      c.height = g.H;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      const cs = getComputedStyle(h1!);
      ctx.scale(g.dpr, g.dpr);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      ctx.textBaseline = "alphabetic";

      // Layout ascent: the baseline of a zero-size inline-block minus the top of the first word box.
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      h1!.prepend(probe);
      const baseY = probe.getBoundingClientRect().bottom;
      const range = document.createRange();
      const walker = document.createTreeWalker(h1!, NodeFilter.SHOW_TEXT);
      const words: { t: string; r: DOMRect }[] = [];
      for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
        const re = /\S+/g;
        for (let mm = re.exec(n.data); mm; mm = re.exec(n.data)) {
          range.setStart(n, mm.index);
          range.setEnd(n, mm.index + mm[0].length);
          const rects = range.getClientRects();
          if (rects.length === 1) {
            words.push({ t: mm[0], r: rects[0] });
            continue;
          }
          // A word split across lines: place it glyph by glyph.
          for (let k = 0; k < mm[0].length; k++) {
            range.setStart(n, mm.index + k);
            range.setEnd(n, mm.index + k + 1);
            words.push({ t: mm[0][k], r: range.getBoundingClientRect() });
          }
        }
      }
      probe.remove();
      const ascent = baseY - words[0].r.top;
      for (const wd of words) ctx.fillText(wd.t, wd.r.left - pr.left, wd.r.top - pr.top + ascent);

      const px = ctx.getImageData(0, 0, g.W, g.H).data;
      const a = new Uint8Array(g.W * g.H);
      for (let i = 0; i < a.length; i++) a[i] = px[i * 4 + 3];

      // Rest position: the window opens one stride left of "vision", so the first frame shows the word whole.
      const v = words.find((wd) => wd.t.toLowerCase().startsWith("vision")) ?? words[0];
      const line = Math.floor((v.r.top + ascent - pr.top - g.m) / g.LH);
      g.rest = { x: v.r.left - pr.left - STRIDE + g.lw / 2, y: g.m + line * g.LH + g.lh / 2 };
      return a;
    }

    function paint() {
      const [r, gg, b] = readAccent();
      for (let i = 0; i < out.length; i += 4) {
        out[i] = r;
        out[i + 1] = gg;
        out[i + 2] = b;
      }
    }

    function setup() {
      G = measure();
      A = rasterize(G);
      M = new Uint16Array(G.W * G.H);
      weights = new Uint8Array(G.W * G.H);
      L = B = tmp = null;
      canvas.width = G.W;
      canvas.height = G.H;
      canvas.style.width = `${G.w}px`;
      canvas.style.height = `${G.h}px`;
      ctxOut = canvas.getContext("2d")!;
      img = ctxOut.createImageData(G.W, G.H);
      out = img.data;
      paint();
      computedTo = 1;
      integral = null;
      sobelMs = 0;
      sobelReady = false;
      lens!.style.width = `${G.lw}px`;
      lens!.style.height = `${G.lh}px`;
      band!.style.width = `${G.w}px`;
      band!.style.height = `${G.h}px`;
      scan!.style.height = `${G.h - 2 * G.m}px`;
    }

    // The intro convolves device-pixel columns [computedTo, col) and shows their Sobel response.
    function sobelTo(col: number) {
      col = Math.min(G.W, col);
      if (col <= computedTo) return;
      const t0 = performance.now();
      sobelMagnitude(A, G.W, G.H, M, computedTo, col);
      sobelMs += performance.now() - t0;
      for (let y = 0; y < G.H; y++) {
        for (let x = computedTo, i = y * G.W + computedTo; x < col; x++, i++) out[i * 4 + 3] = M[i] * GAIN;
      }
      ctxOut.putImageData(img, 0, 0, computedTo, 0, col - computedTo, G.H);
      computedTo = col;
      if (col >= G.W) sobelReady = true;
    }

    // Convolution time only: the threshold, display and summed-area passes are not counted.
    function convolve(k: KernelId): number {
      const N = G.W * G.H;
      if (k === "sobel" || k === "mask") {
        if (!sobelReady) sobelTo(G.W);
        return sobelMs;
      }
      const t0 = performance.now();
      if (k === "laplacian") laplacianMagnitude(A, G.W, G.H, (L ??= new Uint16Array(N)));
      else gaussianBlur(A, G.W, G.H, Math.max(1, Math.round(G.fs * BLUR_EM * G.dpr)), (B ??= new Uint8Array(N)), (tmp ??= new Uint8Array(N)));
      return performance.now() - t0;
    }

    // Display alpha and readout weights for one kernel, then the summed-area table behind the readout.
    function applyKernel(k: KernelId) {
      const ms = convolve(k);
      const N = G.W * G.H;
      integralScale = 1;
      if (k === "sobel" || k === "mask") {
        for (let i = 0; i < N; i++) {
          const edge = M[i] > EDGE_T;
          weights[i] = edge ? 1 : 0;
          out[i * 4 + 3] = k === "mask" ? (edge ? 255 : 0) : M[i] * GAIN;
        }
      } else if (k === "laplacian") {
        for (let i = 0; i < N; i++) {
          weights[i] = L![i] > LAP_T ? 1 : 0;
          out[i * 4 + 3] = L![i] * LAP_GAIN;
        }
      } else {
        // The readout is mean ink under the window, so weights carry the full 0-to-255 value.
        integralScale = 255;
        for (let i = 0; i < N; i++) {
          weights[i] = B![i];
          out[i * 4 + 3] = B![i];
        }
      }
      integral = summedArea(weights, G.W, G.H);
      ctxOut.putImageData(img, 0, 0);
      measuredRef.current?.({ kernel: k, stat: `${((G.W * G.H) / 1e6).toFixed(2)} megapixels in ${ms.toFixed(1)} ms` });
    }

    function density(x: number, y: number) {
      if (!integral) return 0;
      const d = G.dpr;
      const x0 = Math.max(0, Math.round(x * d));
      const y0 = Math.max(0, Math.round(y * d));
      const x1 = Math.min(G.W, Math.round((x + G.lw) * d));
      const y1 = Math.min(G.H, Math.round((y + G.lh) * d));
      const area = (x1 - x0) * (y1 - y0);
      return area > 0 ? (100 * windowSum(integral, G.W, x0, y0, x1, y1)) / (area * integralScale) : 0;
    }

    // Window top-left for a desired centre: x steps on the stride grid, y steps by whole lines,
    // and the window stays over the headline box.
    function targetFor(cx: number, cy: number) {
      const lo = Math.ceil((G.m - 8) / STRIDE) * STRIDE;
      const hi = Math.floor((G.w - G.m - G.lw + 8) / STRIDE) * STRIDE;
      const x = Math.min(hi, Math.max(lo, Math.round((cx - G.lw / 2) / STRIDE) * STRIDE));
      const k = Math.min(G.lines - Math.round(G.lh / G.LH), Math.max(0, Math.round((cy - G.lh / 2 - G.m) / G.LH)));
      return { x, y: G.m + k * G.LH };
    }

    function placeLens(x: number, y: number) {
      const rx = Math.round(x * G.dpr) / G.dpr;
      const ry = Math.round(y * G.dpr) / G.dpr;
      lens!.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      canvas.style.transform = `translate3d(${-rx}px, ${-ry}px, 0)`;
      if (ghost) ghost.style.transform = canvas.style.transform;
      const d = density(rx, ry).toFixed(1);
      if (d !== shown) {
        densityEl!.textContent = d;
        shown = d;
      }
    }

    function showLens() {
      if (lensOn) return;
      lensOn = true;
      lens!.style.opacity = "1";
    }

    function finishIntro() {
      intro?.kill();
      intro = null;
      sobelTo(G.W);
      applyKernel(kernelRef.current);
      if (canvas.parentNode === band) {
        // Hand the live canvas to the lens; a copy stays in the band while it fades out.
        const copy = document.createElement("canvas");
        copy.width = G.W;
        copy.height = G.H;
        copy.className = canvas.className;
        copy.style.cssText = canvas.style.cssText;
        copy.getContext("2d")!.drawImage(canvas, 0, 0);
        band!.replaceChildren(copy);
        scan!.style.opacity = "0";
        later(() => (band!.style.opacity = "0"), 260);
        later(() => band!.replaceChildren(), 1000);
      }
      view!.appendChild(canvas);
      const t = targetFor(G.rest.x, G.rest.y);
      Object.assign(pos, { x: t.x, y: t.y, tx: t.x, ty: t.y, vx: 0, vy: 0 });
      placeLens(t.x, t.y);
      if (lensOn) later(() => (lens!.style.opacity = "1"), reduce ? 0 : 260);
      phase = "live";
      later(() => (wrap!.dataset.state = "live"), reduce ? 0 : 1000);
    }

    function introFrame(p: number) {
      // The scan frontier: every column left of it has been convolved.
      const f = p * G.w;
      sobelTo(Math.ceil(f * G.dpr) + 2);
      band!.style.transform = `translate3d(${f - G.w}px, 0, 0)`;
      (band!.firstChild as HTMLElement).style.transform = `translate3d(${G.w - f}px, 0, 0)`;
      scan!.style.transform = `translate3d(${Math.min(f, G.w - 1)}px, ${G.m}px, 0)`;
    }

    // Semi-implicit Euler in fixed substeps keeps the spring stable at any frame rate. The drawn
    // position is clamped to the plate as well as the target, so an overshoot never leaves it.
    function stepSpring(dt: number) {
      for (let left = dt; left > 0; left -= SPRING_STEP_S) {
        const h = Math.min(left, SPRING_STEP_S);
        pos.vx += (SPRING_K * (pos.tx - pos.x) - SPRING_C * pos.vx) * h;
        pos.vy += (SPRING_K * (pos.ty - pos.y) - SPRING_C * pos.vy) * h;
        pos.x += pos.vx * h;
        pos.y += pos.vy * h;
      }
      const cx = Math.min(G.w - G.lw, Math.max(0, pos.x));
      const cy = Math.min(G.h - G.lh, Math.max(0, pos.y));
      if (cx !== pos.x) pos.vx = 0;
      if (cy !== pos.y) pos.vy = 0;
      pos.x = cx;
      pos.y = cy;
      const settled =
        Math.abs(pos.tx - pos.x) < 0.3 && Math.abs(pos.ty - pos.y) < 0.3 && Math.hypot(pos.vx, pos.vy) < 2;
      if (settled) Object.assign(pos, { x: pos.tx, y: pos.ty, vx: 0, vy: 0 });
      return !settled;
    }

    function frame(now: number) {
      raf = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      if (phase !== "live") return;
      const more = stepSpring(dt);
      placeLens(pos.x, pos.y);
      if (more) kick();
    }

    function kick() {
      if (!raf && visible && !document.hidden && !disposed) raf = requestAnimationFrame(frame);
    }

    function aimAt(e: PointerEvent) {
      if (phase !== "live") return;
      const pr = plate!.getBoundingClientRect();
      const cx = e.clientX - pr.left;
      const cy = e.clientY - pr.top;
      if (cx < 0 || cx > G.w || cy < 0 || cy > G.h) return;
      showLens();
      const t = targetFor(cx, cy);
      pos.tx = t.x;
      pos.ty = t.y;
      if (reduce) {
        Object.assign(pos, { x: t.x, y: t.y, vx: 0, vy: 0 });
        placeLens(t.x, t.y);
        return;
      }
      last = 0;
      kick();
    }

    function clearSweep() {
      sweep?.kill();
      sweep = null;
      ghost?.remove();
      ghost = null;
      lensScan!.style.opacity = "0";
    }

    // A new kernel re-scans the window: the old response is wiped left to right by the new one.
    function setKernel(k: KernelId) {
      if (phase !== "live") return;
      clearSweep();
      if (!reduce) {
        ghost = document.createElement("canvas");
        ghost.width = G.W;
        ghost.height = G.H;
        ghost.className = canvas.className;
        ghost.style.cssText = canvas.style.cssText;
        ghost.getContext("2d")!.drawImage(canvas, 0, 0);
        view!.appendChild(ghost);
      }
      applyKernel(k);
      shown = "";
      placeLens(pos.x, pos.y);
      showLens();
      if (!ghost) return;
      const s = { p: 0 };
      lensScan!.style.opacity = "1";
      sweep = gsap.to(s, {
        p: 1,
        duration: SWEEP_S,
        ease: EASE_OUT,
        onUpdate: () => {
          ghost!.style.clipPath = `inset(0 0 0 ${pos.x + s.p * G.lw}px)`;
          lensScan!.style.transform = `translate3d(${s.p * G.lw}px, 0, 0)`;
        },
        onComplete: clearSweep,
      });
    }
    apiRef.current = { setKernel };

    const onMove = (e: PointerEvent) => e.pointerType !== "touch" && aimAt(e);
    const onVisibility = () => {
      if (!document.hidden) {
        last = 0;
        kick();
      }
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerdown", aimAt);
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) {
        last = 0;
        kick();
      }
    });
    io.observe(wrap);

    let lastWidth = h1.getBoundingClientRect().width;
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      const w = h1.getBoundingClientRect().width;
      if (w === lastWidth) return;
      lastWidth = w;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(relayout, 160);
    });
    ro.observe(h1);

    // A resize mid-intro finishes the intro at the new size instead of being dropped.
    function relayout() {
      if (phase === "idle") return;
      intro?.kill();
      clearSweep();
      setup();
      finishIntro();
    }

    // Moving to a screen with another pixel density changes no CSS size, so watch it directly.
    let dprQuery: MediaQueryList;
    const onDpr = () => {
      dprQuery.removeEventListener("change", onDpr);
      watchDpr();
      relayout();
    };
    function watchDpr() {
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprQuery.addEventListener("change", onDpr);
    }
    watchDpr();

    // next-themes swaps the class on <html> after child effects run, so react to the class itself.
    const themeObserver = new MutationObserver(() => {
      if (phase === "idle") return;
      paint();
      ctxOut.putImageData(img, 0, 0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    function start() {
      if (disposed) return;
      setup();
      if (reduce || document.hidden) {
        finishIntro();
        return;
      }
      band!.appendChild(canvas);
      band!.style.transform = `translate3d(${-G.w}px, 0, 0)`;
      scan!.style.transform = `translate3d(0, ${G.m}px, 0)`;
      band!.style.opacity = "1";
      scan!.style.opacity = "1";
      phase = "intro";
      const s = { p: 0 };
      intro = gsap.to(s, {
        p: 1,
        duration: (1100 + G.w * 0.25) / 1000,
        delay: 0.3,
        ease: "power2.inOut",
        onUpdate: () => introFrame(s.p),
        onComplete: finishIntro,
      });
    }

    const cs = getComputedStyle(h1);
    document.fonts
      .load(`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`)
      .then(() => document.fonts.ready)
      .catch(() => undefined)
      .then(start);

    return () => {
      disposed = true;
      apiRef.current = null;
      intro?.kill();
      clearSweep();
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      dprQuery.removeEventListener("change", onDpr);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", aimAt);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.remove();
      band.replaceChildren();
      band.style.opacity = "0";
      scan.style.opacity = "0";
      lens.style.opacity = "0";
      delete wrap.dataset.state;
    };
  }, [reduce]);

  useEffect(() => {
    kernelRef.current = kernel;
    apiRef.current?.setKernel(kernel);
  }, [kernel]);

  return (
    <div ref={wrapRef} className="relative" data-testid="sobel-headline">
      <h1 ref={h1Ref} id={id} className={className}>
        {text}
      </h1>
      <div ref={plateRef} aria-hidden className="pointer-events-none absolute z-[1]">
        <div
          ref={bandRef}
          className="absolute left-0 top-0 overflow-hidden bg-surface opacity-0 transition-opacity duration-[600ms] will-change-transform"
        />
        <div ref={scanRef} data-scan="intro" className="absolute left-0 top-0 w-px bg-accent opacity-0 will-change-transform" />
        <div
          ref={lensRef}
          className="absolute left-0 top-0 opacity-0 transition-opacity delay-[120ms] duration-500 will-change-transform motion-reduce:transition-none"
        >
          <div
            ref={viewRef}
            className="absolute inset-0 overflow-hidden shadow-[inset_0_0_0_1px_var(--rule)]"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--ink) 20%, transparent) 0.7px, transparent 1px) -4px -4px / 8px 8px, var(--surface)",
            }}
          />
          <div ref={lensScanRef} className="absolute inset-y-0 left-0 w-px bg-accent opacity-0 will-change-transform" />
          {TICKS.map((tick) => (
            <span key={tick} className={cn("absolute size-3 border-ink", tick)} />
          ))}
          <span className="absolute left-4 top-1.5 bg-surface max-sm:hidden px-1 py-[2px] font-mono text-[10px] leading-none text-ink-2">
            {info.chip}
          </span>
          <span className="absolute bottom-1.5 right-4 bg-surface max-sm:hidden px-1 py-[2px] font-mono text-[10px] leading-none tabular-nums text-ink">
            <span ref={densityRef}>0.0</span>
            {info.unit}
          </span>
        </div>
      </div>
    </div>
  );
}
