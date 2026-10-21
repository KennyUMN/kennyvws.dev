"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// The lens rests on an 8px grid, like a strided window over a feature map.
const STRIDE = 8;
// |G| above a quarter of a full 0-to-255 step counts as an edge pixel.
const EDGE_T = 255;
// Maps |G| to alpha so strong glyph edges saturate.
const GAIN = 255 / 520;

interface Geometry {
  W: number;
  H: number;
  dpr: number;
  w: number;
  h: number;
  m: number;
  lw: number;
  lh: number;
  LH: number;
  lines: number;
  rest: { x: number; y: number };
}

interface SobelHeadlineProps {
  id: string;
  text: string;
  className?: string;
  /** Receives the measured cost of the convolution, e.g. "0.41 megapixels in 9.9 ms". */
  onMeasured?: (stat: string) => void;
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
 * The hero headline, with a real 3x3 Sobel filter computed over its own rendered glyphs.
 * An intro scan convolves the line left to right, then a lens follows the pointer and reports
 * the share of edge pixels under it. The h1 stays plain text; everything drawn is aria-hidden.
 */
export function SobelHeadline({ id, text, className, onMeasured }: SobelHeadlineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const densityRef = useRef<HTMLSpanElement>(null);
  const measuredRef = useRef(onMeasured);
  const reduce = useReducedMotion() ?? false;

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
    const densityEl = densityRef.current;
    if (!wrap || !h1 || !plate || !band || !scan || !lens || !view || !densityEl) return;

    const canvas = document.createElement("canvas");
    canvas.className = "absolute left-0 top-0 will-change-transform";
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    let G: Geometry;
    let A: Uint8Array;
    let M: Uint16Array;
    let img: ImageData;
    let out: Uint8ClampedArray;
    let ctxOut: CanvasRenderingContext2D;
    let integral: Uint32Array | null = null;
    let computedTo = 1;
    let msTotal = 0;
    let phase: "idle" | "intro" | "live" = "idle";
    let raf = 0;
    let last = 0;
    let introT0 = 0;
    let visible = true;
    let shown = "";
    // On touch screens there is no hover to move the lens off the words, so it waits for a tap.
    let lensOn = !window.matchMedia("(pointer: coarse)").matches;
    let disposed = false;
    const pos = { x: 0, y: 0, tx: 0, ty: 0 };

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
      return { W: Math.round(w * dpr), H: Math.round(h * dpr), dpr, w, h, m, lw, lh, LH, lines, rest: { x: 0, y: 0 } };
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
      msTotal = 0;
      lens!.style.width = `${G.lw}px`;
      lens!.style.height = `${G.lh}px`;
      band!.style.width = `${G.w}px`;
      band!.style.height = `${G.h}px`;
      scan!.style.height = `${G.h - 2 * G.m}px`;
    }

    // 3x3 Sobel over device-pixel columns [c0, c1).
    function sobel(c0: number, c1: number) {
      const W = G.W;
      const H = G.H;
      c0 = Math.max(1, c0);
      c1 = Math.min(W - 1, c1);
      if (c1 <= c0) return;
      const t0 = performance.now();
      for (let y = 1; y < H - 1; y++) {
        let i = y * W + c0;
        for (let x = c0; x < c1; x++, i++) {
          const a = A[i - W - 1], b = A[i - W], c = A[i - W + 1];
          const d = A[i - 1], f = A[i + 1];
          const g = A[i + W - 1], h = A[i + W], k = A[i + W + 1];
          const gx = c + 2 * f + k - a - 2 * d - g;
          const gy = g + 2 * h + k - a - 2 * b - c;
          const mag = Math.sqrt(gx * gx + gy * gy);
          M[i] = mag;
          out[i * 4 + 3] = mag * GAIN;
        }
      }
      ctxOut.putImageData(img, 0, 0, c0, 0, c1 - c0, H);
      msTotal += performance.now() - t0;
    }

    function sobelTo(col: number) {
      col = Math.min(G.W, col);
      if (col > computedTo) {
        sobel(computedTo, col);
        computedTo = col;
      }
    }

    // Summed-area table of the edge mask, so any window's edge count is four lookups.
    function buildIntegral() {
      const W = G.W;
      const H = G.H;
      const W1 = W + 1;
      const S = new Uint32Array(W1 * (H + 1));
      for (let y = 0; y < H; y++) {
        let row = 0;
        for (let x = 0; x < W; x++) {
          row += M[y * W + x] > EDGE_T ? 1 : 0;
          S[(y + 1) * W1 + x + 1] = S[y * W1 + x + 1] + row;
        }
      }
      integral = S;
      measuredRef.current?.(`${((G.W * G.H) / 1e6).toFixed(2)} megapixels in ${msTotal.toFixed(1)} ms`);
    }

    function density(x: number, y: number) {
      if (!integral) return 0;
      const W1 = G.W + 1;
      const d = G.dpr;
      const x0 = Math.round(x * d);
      const y0 = Math.round(y * d);
      const x1 = Math.min(G.W, Math.round((x + G.lw) * d));
      const y1 = Math.min(G.H, Math.round((y + G.lh) * d));
      const S = integral;
      return (100 * (S[y1 * W1 + x1] - S[y0 * W1 + x1] - S[y1 * W1 + x0] + S[y0 * W1 + x0])) / ((x1 - x0) * (y1 - y0));
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
      const d = density(rx, ry).toFixed(1);
      if (d !== shown) {
        densityEl!.textContent = d;
        shown = d;
      }
    }

    function finishIntro() {
      sobelTo(G.W);
      buildIntegral();
      if (canvas.parentNode === band) {
        // Hand the live canvas to the lens; a copy stays in the band while it fades out.
        const ghost = document.createElement("canvas");
        ghost.width = G.W;
        ghost.height = G.H;
        ghost.className = canvas.className;
        ghost.style.cssText = canvas.style.cssText;
        ghost.getContext("2d")!.drawImage(canvas, 0, 0);
        band!.replaceChildren(ghost);
        scan!.style.opacity = "0";
        later(() => (band!.style.opacity = "0"), 260);
        later(() => band!.replaceChildren(), 1000);
      }
      view!.appendChild(canvas);
      const t = targetFor(G.rest.x, G.rest.y);
      pos.x = pos.tx = t.x;
      pos.y = pos.ty = t.y;
      placeLens(t.x, t.y);
      if (lensOn) later(() => (lens!.style.opacity = "1"), reduce ? 0 : 260);
      phase = "live";
      later(() => (wrap!.dataset.state = "live"), reduce ? 0 : 1000);
    }

    const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function frame(now: number) {
      raf = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      let more = false;
      if (phase === "intro") {
        const p = Math.min(1, Math.max(0, (now - introT0) / (1100 + G.w * 0.25)));
        // The scan frontier: every column left of it has been convolved.
        const f = easeInOut(p) * G.w;
        sobelTo(Math.ceil(f * G.dpr) + 2);
        band!.style.transform = `translate3d(${f - G.w}px, 0, 0)`;
        (band!.firstChild as HTMLElement).style.transform = `translate3d(${G.w - f}px, 0, 0)`;
        scan!.style.transform = `translate3d(${Math.min(f, G.w - 1)}px, ${G.m}px, 0)`;
        if (p < 1) more = true;
        else finishIntro();
      } else if (phase === "live") {
        const k = 1 - Math.exp(-dt / 0.085);
        pos.x += (pos.tx - pos.x) * k;
        pos.y += (pos.ty - pos.y) * k;
        if (Math.abs(pos.tx - pos.x) < 0.3 && Math.abs(pos.ty - pos.y) < 0.3) {
          pos.x = pos.tx;
          pos.y = pos.ty;
        } else more = true;
        placeLens(pos.x, pos.y);
      }
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
      if (!lensOn) {
        lensOn = true;
        lens!.style.opacity = "1";
      }
      const t = targetFor(cx, cy);
      pos.tx = t.x;
      pos.ty = t.y;
      if (reduce) {
        pos.x = t.x;
        pos.y = t.y;
        placeLens(t.x, t.y);
        return;
      }
      last = 0;
      kick();
    }

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
      introT0 = performance.now() + 300;
      last = 0;
      kick();
    }

    const cs = getComputedStyle(h1);
    document.fonts
      .load(`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`)
      .then(() => document.fonts.ready)
      .catch(() => undefined)
      .then(start);

    return () => {
      disposed = true;
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
        <div ref={scanRef} className="absolute left-0 top-0 w-px bg-accent opacity-0 will-change-transform" />
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
          {TICKS.map((tick) => (
            <span key={tick} className={cn("absolute size-3 border-ink", tick)} />
          ))}
          <span className="absolute left-4 top-1.5 bg-surface max-sm:hidden px-1 py-[2px] font-mono text-[10px] leading-none text-ink-2">
            Sobel 3×3
          </span>
          <span className="absolute bottom-1.5 right-4 bg-surface max-sm:hidden px-1 py-[2px] font-mono text-[10px] leading-none tabular-nums text-ink">
            <span ref={densityRef}>0.0</span>% edge px
          </span>
        </div>
      </div>
    </div>
  );
}
