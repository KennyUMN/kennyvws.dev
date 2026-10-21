"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useScroll } from "motion/react";
import type { EpochMetrics } from "@/data/ppeTraining";

const VB_W = 1000;
const VB_H = 400;
const Y_MIN = 0.3;
const Y_MAX = 0.7;
const Y_TICKS = [0.3, 0.4, 0.5, 0.6, 0.7];

interface TrainingCurveProps {
  data: EpochMetrics[];
  source: string;
}

const fmt = (v: number) => v.toFixed(3);
const readout = (d: EpochMetrics) => `epoch ${String(d.epoch).padStart(2, "0")} · ${fmt(d.map50)}`;

export function TrainingCurve({ data, source }: TrainingCurveProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const peakRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);

  const last = data.length - 1;
  const xPct = (i: number) => (i / last) * 100;
  const yPct = (v: number) => (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * 100;
  const peakIdx = data.reduce((best, d, i) => (d.map50 > data[best].map50 ? i : best), 0);

  const line = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${(xPct(i) / 100) * VB_W},${(yPct(d.map50) / 100) * VB_H}`)
    .join(" ");
  const area = `${line} L${VB_W},${VB_H} L0,${VB_H} Z`;

  // Scroll is the training clock: the plate's travel up the viewport maps to epochs.
  // Applied imperatively after mount, so the server render and first client render agree (epoch 1).
  const { scrollYProgress } = useScroll({ target: plotRef, offset: ["start 85%", "end 45%"] });
  useEffect(() => {
    const apply = (p: number) => {
      const i = Math.round(p * last);
      if (svgRef.current) svgRef.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
      if (readoutRef.current) readoutRef.current.textContent = readout(data[i]);
      if (peakRef.current) peakRef.current.style.opacity = i >= peakIdx ? "1" : "0";
      if (endRef.current) endRef.current.style.opacity = i >= last ? "1" : "0";
    };
    if (reduce) {
      apply(1);
      return;
    }
    apply(scrollYProgress.get());
    return scrollYProgress.on("change", apply);
  }, [reduce, scrollYProgress, data, last, peakIdx]);

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - box.left) / box.width) * last);
    setHover(Math.min(last, Math.max(0, i)));
  };

  return (
    <figure className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.08em] text-ink-2">
        <span>mAP@50 by epoch</span>
        <span ref={readoutRef} className="tabular-nums text-ink">
          {readout(data[0])}
        </span>
      </div>

      <div
        ref={plotRef}
        className="relative aspect-[8/5] w-full touch-pan-y sm:aspect-[5/2]"
        onPointerMove={onPointer}
        onPointerLeave={() => setHover(null)}
        aria-hidden
      >
        {Y_TICKS.map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-rule" style={{ top: `${yPct(t)}%` }}>
            <span className="absolute -top-2.5 left-0 -translate-x-[calc(100%+10px)] font-mono text-[10px] tabular-nums text-ink-3 max-sm:hidden">
              {t.toFixed(1)}
            </span>
          </div>
        ))}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          <defs>
            <linearGradient id="curve-wash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity={0.16} />
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

        <Marker
          ref={peakRef}
          x={xPct(peakIdx)}
          y={yPct(data[peakIdx].map50)}
          label={`Peak ${fmt(data[peakIdx].map50)}`}
          sub={`epoch ${data[peakIdx].epoch}`}
          above
        />
        <Marker
          ref={endRef}
          x={100}
          y={yPct(data[last].map50)}
          label={fmt(data[last].map50)}
          sub={`epoch ${data[last].epoch}`}
          align="end"
        />

        {hover !== null && (
          <>
            <div className="pointer-events-none absolute inset-y-0 w-px bg-ink/40" style={{ left: `${xPct(hover)}%` }} />
            <div
              className="pointer-events-none absolute z-10 w-44 border border-rule bg-surface-raised p-3 font-mono text-[11px] leading-5 shadow-lift"
              style={{
                left: `${xPct(hover)}%`,
                top: 0,
                transform: `translateX(${xPct(hover) > 60 ? "calc(-100% - 12px)" : "12px"})`,
              }}
            >
              <div className="mb-1 text-ink-2">Epoch {data[hover].epoch}</div>
              <Row k="mAP@50" v={data[hover].map50} strong />
              <Row k="mAP@50-95" v={data[hover].map5095} />
              <Row k="Precision" v={data[hover].precision} />
              <Row k="Recall" v={data[hover].recall} />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between font-mono text-[10px] tabular-nums text-ink-3">
        {[1, 10, 20, 30, 40, 50].map((e) => (
          <span key={e}>{e === 1 ? "epoch 1" : e}</span>
        ))}
      </div>

      <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-ink-2">
        <span>{source}</span>
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

interface MarkerProps {
  ref: React.Ref<HTMLDivElement>;
  x: number;
  y: number;
  label: string;
  sub: string;
  above?: boolean;
  align?: "start" | "end";
}

function Marker({ ref, x, y, label, sub, above, align = "start" }: MarkerProps) {
  return (
    <div ref={ref} className="pointer-events-none absolute" style={{ left: `${x}%`, top: `${y}%`, opacity: 0 }}>
      <span className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent" />
      <span
        className={`absolute whitespace-nowrap font-mono text-[11px] leading-4 ${above ? "bottom-3" : "top-3"} ${
          align === "end" ? "right-1" : "-translate-x-1/2"
        }`}
      >
        <span className="block font-semibold text-ink">{label}</span>
        <span className="block text-ink-2">{sub}</span>
      </span>
    </div>
  );
}

function TrainingTable({ data }: { data: EpochMetrics[] }) {
  return (
    <div className="mt-3 max-h-72 overflow-auto border border-rule">
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
