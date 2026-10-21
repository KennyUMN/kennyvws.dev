"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, useScroll } from "motion/react";

const T = 1000;
const S = 0.008;
const HEAL_PER_S = T / 0.6;
const POINTER_PEAK = 720;
const SHIMMER_TAU_S = 0.07;
const JITTER = 0.15;
const DOT_K = 0.86;
const TAU = Math.PI * 2;
// The shimmer stops this long after the last scroll or pointer input; the frame stays as drawn.
const SETTLE_MS = 1500;

// Nichol and Dhariwal cosine schedule: abar(t) = f(t) / f(0), f(t) = cos^2(((t/T + s) / (1 + s)) * pi/2).
const f = (t: number) => Math.cos((((t / T + S) / (1 + S)) * Math.PI) / 2) ** 2;
const SIG = new Float32Array(T + 1);
const NOI = new Float32Array(T + 1);
for (let t = 0; t <= T; t++) {
  const abar = Math.min(1, Math.max(0, f(t) / f(0)));
  SIG[t] = Math.sqrt(abar);
  NOI[t] = Math.sqrt(1 - abar);
}

const gauss = () => {
  let u = 0;
  while (!u) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * Math.random());
};

/**
 * Sign-off wordmark: the name as a 45-degree halftone, sampled out of noise by running the
 * variance-preserving forward process backwards. Scrolling to the end of the page is the sampler:
 * the timestep falls to zero as the plate reaches the bottom of the viewport. The pointer adds noise
 * back locally.
 */
export function Signoff({ word }: { word: string }) {
  const plateRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: plateRef, offset: ["start end", "end end"] });

  useEffect(() => {
    const plate = plateRef.current;
    const canvas = canvasRef.current;
    const readout = readoutRef.current;
    if (!plate || !canvas || !readout) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let pitch = 8;
    let sigma = 60;
    let n = 0;
    let X = new Float32Array(0);
    let Y = new Float32Array(0);
    let X0 = new Float32Array(0);
    let E = new Float32Array(0);
    let EX = new Float32Array(0);
    let EY = new Float32Array(0);
    let TL = new Float32Array(0);
    let scrollT = reduce ? 0 : T;
    let visible = false;
    let raf = 0;
    let last = 0;
    let shownT = -1;
    let ink = "";
    let pointer: { x: number; y: number; px: number; py: number } | null = null;
    let prev: { x: number; y: number } | null = null;
    let ready = false;
    let healing = false;
    let lastInput = 0;
    let disposed = false;

    function readPalette() {
      const css = getComputedStyle(document.documentElement);
      ink = css.getPropertyValue("--ink").trim();
    }

    function rasterize() {
      const off = document.createElement("canvas");
      off.width = Math.ceil(W);
      off.height = Math.ceil(H);
      const o = off.getContext("2d", { willReadFrequently: true })!;
      const family = getComputedStyle(document.body).fontFamily;
      // Assigning ctx.font resets fontStretch, so the stretch follows every font assignment.
      o.font = `900 100px ${family}`;
      o.fontStretch = "expanded";
      let m = o.measureText(word);
      const scale = Math.min(
        (W * 0.985) / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight),
        (H * 0.92) / (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent),
      );
      o.font = `900 ${100 * scale}px ${family}`;
      o.fontStretch = "expanded";
      m = o.measureText(word);
      const tw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const top = (H - (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent)) / 2;
      o.filter = `blur(${pitch * 0.32}px)`;
      o.fillStyle = "#000";
      o.fillText(word, (W - tw) / 2 + m.actualBoundingBoxLeft, top + m.actualBoundingBoxAscent);
      o.filter = "none";
      // Tonal ramp so dot size carries a gradient, the way a halftone carries a photograph.
      o.globalCompositeOperation = "destination-in";
      const g = o.createLinearGradient(0, top, 0, H - top);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0.42)");
      o.fillStyle = g;
      o.fillRect(0, 0, off.width, off.height);

      const a = o.getImageData(0, 0, off.width, off.height).data;
      const iw = off.width + 1;
      const I = new Float64Array(iw * (off.height + 1));
      for (let y = 0; y < off.height; y++) {
        let row = 0;
        for (let x = 0; x < off.width; x++) {
          row += a[(y * off.width + x) * 4 + 3] / 255;
          I[(y + 1) * iw + x + 1] = I[y * iw + x + 1] + row;
        }
      }
      return (cx: number, cy: number) => {
        const h = pitch / 2;
        const x0 = Math.max(0, Math.round(cx - h));
        const x1 = Math.min(off.width, Math.round(cx + h));
        const y0 = Math.max(0, Math.round(cy - h));
        const y1 = Math.min(off.height, Math.round(cy + h));
        const area = (x1 - x0) * (y1 - y0);
        if (area <= 0) return 0;
        return (I[y1 * iw + x1] - I[y0 * iw + x1] - I[y1 * iw + x0] + I[y0 * iw + x0]) / area;
      };
    }

    function build() {
      const r = plate!.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      pitch = W < 600 ? 4.4 : Math.min(10, Math.max(6.5, W / 150));
      sigma = W < 600 ? 28 : 64;
      const coverage = rasterize();

      // 45-degree screen angle, the classic angle for the black plate.
      const pts: number[] = [];
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.hypot(W, H) / 2 + pitch;
      const c = Math.SQRT1_2;
      for (let i = -R; i <= R; i += pitch) {
        for (let j = -R; j <= R; j += pitch) {
          const x = cx + (i - j) * c;
          const y = cy + (i + j) * c;
          if (x < pitch / 2 || x > W - pitch / 2 || y < pitch / 2 || y > H - pitch / 2) continue;
          pts.push(x, y, coverage(x, y));
        }
      }
      n = pts.length / 3;
      X = new Float32Array(n);
      Y = new Float32Array(n);
      X0 = new Float32Array(n);
      E = new Float32Array(n);
      EX = new Float32Array(n);
      EY = new Float32Array(n);
      TL = new Float32Array(n);
      for (let k = 0; k < n; k++) {
        X[k] = pts[k * 3];
        Y[k] = pts[k * 3 + 1];
        X0[k] = 2 * Math.min(1, pts[k * 3 + 2]) - 1;
        E[k] = gauss();
        EX[k] = gauss();
        EY[k] = gauss();
      }
    }

    function draw(dt: number) {
      const heal = dt * HEAL_PER_S;
      const rho = Math.exp(-dt / SHIMMER_TAU_S);
      const kick = Math.sqrt(1 - rho * rho);
      const path = new Path2D();
      let tMax = 0;
      healing = false;
      for (let i = 0; i < n; i++) {
        if (TL[i] > 0) {
          TL[i] = Math.max(0, TL[i] - heal);
          healing ||= TL[i] > 0;
        }
        const t = Math.round(Math.max(TL[i], scrollT));
        if (t > tMax) tMax = t;
        let x = X[i];
        let y = Y[i];
        let v = X0[i];
        if (t > 0) {
          if (dt > 0) {
            E[i] = rho * E[i] + kick * gauss();
            EX[i] = rho * EX[i] + kick * gauss();
            EY[i] = rho * EY[i] + kick * gauss();
          }
          const q = NOI[t];
          const signal = SIG[t] * v;
          const noise = q * E[i];
          // Forward process on the dot's value: x_t = sqrt(abar) x_0 + sqrt(1 - abar) eps.
          v = signal + noise;
          x += q * EX[i] * pitch * JITTER;
          y += q * EY[i] * pitch * JITTER;
        }
        const cov = (v + 1) / 2;
        if (cov <= 0) continue;
        const r = pitch * Math.sqrt(Math.min(1, cov) / Math.PI) * DOT_K;
        if (r < 0.4) continue;
        path.moveTo(x + r, y);
        path.arc(x, y, r, 0, TAU);
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = ink;
      ctx!.fill(path);
      if (tMax !== shownT) {
        shownT = tMax;
        readout!.textContent = `t = ${tMax}`;
      }
      return tMax;
    }

    function injectAt(px: number, py: number) {
      const s2 = 2 * sigma * sigma;
      const lim = 9 * sigma * sigma;
      for (let i = 0; i < n; i++) {
        const dx = X[i] - px;
        const dy = Y[i] - py;
        const d2 = dx * dx + dy * dy;
        if (d2 > lim) continue;
        const t = POINTER_PEAK * Math.exp(-d2 / s2);
        if (t > TL[i]) TL[i] = t;
      }
    }

    // Inject along the segment travelled since the last frame so fast strokes leave no gaps.
    function inject() {
      if (!pointer) return;
      const { x, y, px, py } = pointer;
      const steps = Math.max(1, Math.ceil(Math.hypot(x - px, y - py) / (sigma * 0.4)));
      for (let s = 1; s <= steps; s++) injectAt(px + ((x - px) * s) / steps, py + ((y - py) * s) / steps);
      pointer = null;
    }

    function frame(now: number) {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      inject();
      const tMax = draw(dt);
      if (tMax > 0 && (healing || now - lastInput < SETTLE_MS)) schedule();
      else last = 0;
    }

    function wake() {
      lastInput = performance.now();
      schedule();
    }

    function schedule() {
      if (ready && !raf && visible && !document.hidden && !disposed) raf = requestAnimationFrame(frame);
    }

    const local = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      const p = local(e);
      pointer = pointer ? { ...pointer, ...p } : { ...p, px: prev ? prev.x : p.x, py: prev ? prev.y : p.y };
      prev = p;
      wake();
    };
    const onLeave = () => (prev = null);
    const onDown = (e: PointerEvent) => {
      if (reduce || e.pointerType === "mouse") return;
      const p = local(e);
      pointer = { ...p, px: p.x, py: p.y };
      wake();
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);

    // Squared, so the word is legible for the last stretch of scroll and pure noise as it enters.
    const onProgress = (p: number) => {
      if (reduce) return;
      const next = Math.round(T * (1 - p) * (1 - p));
      if (next !== scrollT) {
        scrollT = next;
        wake();
      }
    };
    const unsubscribe = scrollYProgress.on("change", onProgress);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    io.observe(plate);
    const onVisibility = () => {
      last = 0;
      schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 120);
    });
    ro.observe(plate);

    function rebuild() {
      if (!ready) return;
      build();
      if (!raf) draw(0);
    }

    // Moving to a screen with another pixel density changes no CSS size, so watch it directly.
    let dprQuery: MediaQueryList;
    const onDpr = () => {
      dprQuery.removeEventListener("change", onDpr);
      watchDpr();
      rebuild();
    };
    function watchDpr() {
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprQuery.addEventListener("change", onDpr);
    }
    watchDpr();

    // next-themes swaps the class on <html> after child effects run, so react to the class itself.
    const themeObserver = new MutationObserver(() => {
      if (!ready) return;
      readPalette();
      if (!raf) draw(0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    document.fonts.ready.then(() => {
      if (disposed) return;
      ready = true;
      readPalette();
      build();
      onProgress(scrollYProgress.get());
      draw(0);
      plate.dataset.state = "ready";
      wake();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      unsubscribe();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      dprQuery.removeEventListener("change", onDpr);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [reduce, scrollYProgress, word]);

  return (
    <figure aria-hidden className="select-none">
      <div ref={plateRef} data-testid="signoff" className="relative aspect-[5.2/1] w-full">
        <canvas ref={canvasRef} className="absolute inset-0 size-full touch-pan-y" />
      </div>
      <figcaption className="mt-3 flex justify-between font-mono text-[11px] text-ink-3">
        <span>Forward process played backwards, cosine schedule</span>
        <span ref={readoutRef} className="whitespace-nowrap tabular-nums">
          t = {T}
        </span>
      </figcaption>
    </figure>
  );
}
