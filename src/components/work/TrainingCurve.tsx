"use client";

import { useRef, useState } from "react";
import type { EpochMetrics } from "@/data/ppeTraining";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, MOTION_OK, MOTION_REDUCE, ScrollTrigger } from "@/lib/gsap";
import { useIdleGSAP } from "@/hooks/useIdleGSAP";
import { layoutTop } from "@/lib/utils";

const VB_W = 1000;
const VB_H = 400;
// The crosshair glides to the snapped epoch instead of jumping, so stepping feels magnetic.
const GLIDE_S = 0.32;
// After a touch drag, the readout stays long enough to read.
const TOUCH_LINGER_MS = 1600;
const PAGE_STEP = 10;

interface TrainingCurveProps {
  data: EpochMetrics[];
  source: string;
  /** A single comparison score drawn as a reference line, e.g. the supervised-only result. */
  reference?: { label: string; value: number };
}

const fmt = (v: number) => v.toFixed(3);
const headText = (d: EpochMetrics) => `epoch ${String(d.epoch).padStart(2, "0")} · ${fmt(d.map50)}`;
const valueText = (d: EpochMetrics) =>
  `Epoch ${d.epoch}: mAP@50 ${fmt(d.map50)}, mAP@50-95 ${fmt(d.map5095)}, precision ${fmt(d.precision)}, recall ${fmt(d.recall)}`;

export function TrainingCurve({ data, source, reference }: TrainingCurveProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const headTextRef = useRef<HTMLSpanElement>(null);
  const peakRef = useRef<HTMLDivElement>(null);
  const gainRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const glide = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  const dragging = useRef(false);
  const lingerTimer = useRef(0);
  const reduce = useReducedMotion();
  const [inspect, setInspect] = useState<number | null>(null);

  const last = data.length - 1;
  const final = data[last];
  // Axis range and ticks come from the log itself, so a re-imported run is drawn to scale.
  const values = data.map((d) => d.map50);
  const yMin = Math.floor(Math.min(...values) * 10) / 10;
  const yMax = Math.ceil(Math.max(...values) * 10) / 10;
  const yTicks = Array.from({ length: Math.round((yMax - yMin) * 10) + 1 }, (_, k) => Number((yMin + k / 10).toFixed(1)));
  const xTicks = data.flatMap((d, i) => (i === 0 || i === last || d.epoch % 10 === 0 ? [{ i, epoch: d.epoch }] : []));
  const xPct = (i: number) => (i / last) * 100;
  const yPct = (v: number) => (1 - (v - yMin) / (yMax - yMin)) * 100;
  const peakIdx = data.reduce((best, d, i) => (d.map50 > data[best].map50 ? i : best), 0);
  const peak = data[peakIdx];

  const line = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${(xPct(i) / 100) * VB_W},${(yPct(d.map50) / 100) * VB_H}`)
    .join(" ");
  const area = `${line} L${VB_W},${VB_H} L0,${VB_H} Z`;

  // Scroll is the training clock: the plot's travel up the viewport maps to epochs, ending while
  // the whole plot is still on screen. Applied after mount, so the server render and the first
  // client render agree (epoch 1).
  useIdleGSAP(() => {
    const apply = (p: number) => {
      const i = Math.round(p * last);
      const x = (i / last) * 100;
      const y = (1 - (data[i].map50 - yMin) / (yMax - yMin)) * 100;
      if (svgRef.current) svgRef.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
      if (headRef.current) {
        headRef.current.style.transform = `translate3d(${x}%, ${y}%, 0)`;
        headRef.current.dataset.side = x > 72 ? "left" : "right";
      }
      if (headTextRef.current) headTextRef.current.textContent = headText(data[i]);
      // The peak and the gap it opens over the baseline appear once the clock reaches that epoch.
      const reached = String(i >= peakIdx);
      if (peakRef.current) peakRef.current.dataset.on = reached;
      if (gainRef.current) gainRef.current.dataset.on = reached;
    };
    const mm = gsap.matchMedia();
    mm.add(MOTION_REDUCE, () => apply(1));
    mm.add(MOTION_OK, () => {
      const plot = plotRef.current!;
      const trigger = ScrollTrigger.create({
        start: () => layoutTop(plot) - window.innerHeight * 0.85,
        end: () => layoutTop(plot) - window.innerHeight * 0.25,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      apply(trigger.progress);
    });
    glide.current = {
      x: gsap.quickTo(scrubRef.current, "x", { duration: GLIDE_S, ease: "power3.out" }),
      y: gsap.quickTo(dotRef.current, "y", { duration: GLIDE_S, ease: "power3.out" }),
    };
  });

  // Move the crosshair to epoch index i. The first placement jumps; later ones glide.
  const show = (i: number) => {
    const box = plotRef.current!.getBoundingClientRect();
    const x = (i / last) * box.width;
    const y = (yPct(data[i].map50) / 100) * box.height;
    const jump = inspect === null || reduce;
    if (jump) {
      glide.current?.x(x, x);
      glide.current?.y(y, y);
    } else {
      glide.current?.x(x);
      glide.current?.y(y);
    }
    setInspect(i);
  };
  const hide = () => setInspect(null);
  const indexAt = (clientX: number) => {
    const box = plotRef.current!.getBoundingClientRect();
    return Math.min(last, Math.max(0, Math.round(((clientX - box.left) / box.width) * last)));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    window.clearTimeout(lingerTimer.current);
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    show(indexAt(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" && !dragging.current) return;
    show(indexAt(e.clientX));
  };
  const endTouch = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    dragging.current = false;
    lingerTimer.current = window.setTimeout(hide, TOUCH_LINGER_MS);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const at = inspect ?? last;
    const next = {
      ArrowRight: at + 1,
      ArrowUp: at + 1,
      ArrowLeft: at - 1,
      ArrowDown: at - 1,
      PageUp: at + PAGE_STEP,
      PageDown: at - PAGE_STEP,
      Home: 0,
      End: last,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    show(Math.min(last, Math.max(0, next)));
  };

  const shownIdx = inspect ?? last;
  const shown = data[shownIdx];
  const tipLeft = xPct(shownIdx) > 60;

  return (
    <figure className="flex flex-col gap-4">
      <p className="font-mono text-[12px] text-ink-2">mAP@50 by epoch</p>

      {/* A slider over the log: pointer, touch drag and arrow keys all inspect one epoch. Its drawing
          is presentational; the table below carries the same numbers as text. */}
      <div
        ref={plotRef}
        role="slider"
        tabIndex={0}
        aria-label="Training epoch"
        aria-valuemin={data[0].epoch}
        aria-valuemax={final.epoch}
        aria-valuenow={shown.epoch}
        aria-valuetext={valueText(shown)}
        className="relative aspect-[8/5] w-full touch-pan-y outline-offset-8 sm:aspect-[5/2]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endTouch}
        onPointerCancel={endTouch}
        onPointerLeave={(e) => e.pointerType !== "touch" && hide()}
        onKeyDown={onKeyDown}
        // Keyboard focus opens the readout at the last epoch; a click lets the pointer place it.
        onFocus={(e) => inspect === null && e.currentTarget.matches(":focus-visible") && show(last)}
        onBlur={hide}
      >
        {yTicks.map((t) => (
          <div key={t} aria-hidden className="absolute inset-x-0 border-t border-rule" style={{ top: `${yPct(t)}%` }}>
            <span
              className={`absolute -top-4 left-0 font-mono text-[10px] tabular-nums text-ink-3 ${
                t === yMin || t === yMax ? "" : "max-sm:hidden"
              }`}
            >
              {t.toFixed(1)}
            </span>
          </div>
        ))}

        {reference && (
          <div aria-hidden className="absolute inset-x-0 border-t border-ink-3" style={{ top: `${yPct(reference.value)}%` }}>
            <span className="absolute right-0 top-1.5 max-w-[60%] text-right font-mono text-[11px] leading-4 text-ink-2">
              {reference.label}
            </span>
          </div>
        )}

        {/* The gap pseudo-labeling opens over the supervised-only score, at the epoch the ablation reports. */}
        {reference && (
          <div
            ref={gainRef}
            aria-hidden
            data-on="false"
            className="pointer-events-none absolute w-px origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] data-[on=true]:scale-y-100 motion-reduce:transition-none"
            style={{
              left: `${xPct(peakIdx)}%`,
              top: `${yPct(peak.map50)}%`,
              height: `${yPct(reference.value) - yPct(peak.map50)}%`,
            }}
          >
            <span className="absolute -left-1 top-0 h-px w-2 bg-ink" />
            <span className="absolute -left-1 bottom-0 h-px w-2 bg-ink" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[11px] text-ink-2 max-sm:hidden">
              Pseudo-labeling gain
            </span>
          </div>
        )}

        <svg
          ref={svgRef}
          aria-hidden
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          <defs>
            <linearGradient id="curve-wash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" style={{ stopOpacity: "var(--wash)" }} />
              <stop offset="1" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#curve-wash)" />
          <path
            d={line}
            fill="none"
            className="stroke-accent"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div
          ref={peakRef}
          aria-hidden
          data-on="false"
          className="group/peak pointer-events-none absolute"
          style={{ left: `${xPct(peakIdx)}%`, top: `${yPct(peak.map50)}%` }}
        >
          <span className="absolute size-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full border-2 border-surface bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[on=true]/peak:scale-100 motion-reduce:transition-none" />
          <span className="absolute bottom-3 -translate-x-1/2 translate-y-1 whitespace-nowrap font-mono text-[11px] leading-4 opacity-0 transition-[opacity,translate] duration-500 group-data-[on=true]/peak:translate-y-0 group-data-[on=true]/peak:opacity-100 motion-reduce:transition-none">
            <span className="block font-semibold text-ink">Peak {fmt(peak.map50)}</span>
            <span className="block text-ink-2">epoch {peak.epoch}</span>
          </span>
        </div>

        {/* The drawing edge: a dot and a readout that ride the curve as it is drawn. The plot-sized
            layer moves by its own size, so a slightly larger clip keeps it from widening the page. */}
        <div aria-hidden className="pointer-events-none absolute -inset-4 overflow-hidden">
          <div
            ref={headRef}
            data-side="right"
            className={`group absolute inset-4 transition-opacity duration-200 will-change-transform ${inspect === null ? "" : "opacity-0"}`}
            style={{ transform: `translate3d(0%, ${yPct(data[0].map50)}%, 0)` }}
          >
            <span className="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink" />
            <span
              ref={headTextRef}
              className="absolute left-0 top-3 translate-x-2 whitespace-nowrap bg-surface/80 px-1 font-mono text-[11px] tabular-nums text-ink group-data-[side=left]:-translate-x-full"
            >
              {headText(data[0])}
            </span>
          </div>
        </div>

        {/* The inspector: a zero-width layer, so moving it never widens the page. */}
        <div
          ref={scrubRef}
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-0 transition-opacity duration-150 ${inspect === null ? "opacity-0" : ""}`}
        >
          <span className="absolute inset-y-0 left-0 w-px bg-ink/40" />
          <span ref={dotRef} className="absolute left-0 top-0 block">
            <span className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent" />
          </span>
          <div
            className="absolute top-0 z-10 w-44 border border-rule bg-surface-raised p-3 font-mono text-[11px] leading-5 shadow-lift"
            style={{ transform: `translateX(${tipLeft ? "calc(-100% - 12px)" : "12px"})` }}
          >
            <div className="mb-1 text-ink-2">Epoch {shown.epoch}</div>
            <Row k="mAP@50" v={shown.map50} strong />
            <Row k="mAP@50-95" v={shown.map5095} />
            <Row k="Precision" v={shown.precision} />
            <Row k="Recall" v={shown.recall} />
          </div>
        </div>
      </div>

      <div aria-hidden className="relative h-3 font-mono text-[10px] leading-none tabular-nums text-ink-3">
        {xTicks.map(({ i, epoch }) => (
          <span
            key={epoch}
            className={`absolute top-0 ${i === 0 ? "" : i === last ? "-translate-x-full" : "-translate-x-1/2"}`}
            style={{ left: `${xPct(i)}%` }}
          >
            {epoch}
          </span>
        ))}
      </div>

      <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-ink-2">
        <span>
          {source}. Epoch {final.epoch}: precision {fmt(final.precision)}, recall {fmt(final.recall)}, mAP@50-95{" "}
          {fmt(final.map5095)}. <span className="pointer-coarse:hidden">Point at the curve to read any epoch.</span>
          <span className="hidden pointer-coarse:inline">Drag across the curve to read any epoch.</span>
        </span>
        <details>
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center font-medium text-ink [&::-webkit-details-marker]:hidden">
            <span className="link-draw">View as table</span>
          </summary>
          <TrainingTable data={data} />
        </details>
      </figcaption>
    </figure>
  );
}

function Row({ k, v, strong }: { k: string; v: number; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ink-2">{k}</span>
      <span className={strong ? "font-semibold text-ink" : "text-ink"}>{fmt(v)}</span>
    </div>
  );
}

function TrainingTable({ data }: { data: EpochMetrics[] }) {
  return (
    <div data-lenis-prevent className="mt-3 max-h-72 overflow-auto border border-rule">
      <table className="w-full font-mono text-[11px] tabular-nums">
        <caption className="sr-only">Per-epoch validation metrics</caption>
        <thead className="sticky top-0 bg-surface-raised text-left text-ink-2">
          <tr>
            {["Epoch", "mAP@50", "mAP@50-95", "Precision", "Recall"].map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.epoch} className="text-ink">
              <td className="px-3 py-1">{d.epoch}</td>
              <td className="px-3 py-1">{fmt(d.map50)}</td>
              <td className="px-3 py-1">{fmt(d.map5095)}</td>
              <td className="px-3 py-1">{fmt(d.precision)}</td>
              <td className="px-3 py-1">{fmt(d.recall)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
