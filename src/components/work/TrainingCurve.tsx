"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useScroll } from "motion/react";
import type { EpochMetrics } from "@/data/ppeTraining";

const VB_W = 1000;
const VB_H = 400;

interface TrainingCurveProps {
  data: EpochMetrics[];
  source: string;
  /** A single comparison score drawn as a reference line, e.g. the supervised-only result. */
  reference?: { label: string; value: number };
}

const fmt = (v: number) => v.toFixed(3);
const headText = (d: EpochMetrics) =>
  `epoch ${String(d.epoch).padStart(2, "0")} · ${fmt(d.map50)}`;

export function TrainingCurve({ data, source, reference }: TrainingCurveProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const headTextRef = useRef<HTMLSpanElement>(null);
  const peakRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);

  const last = data.length - 1;
  const final = data[last];
  // Axis range and ticks come from the log itself, so a re-imported run is drawn to scale.
  const values = data.map((d) => d.map50);
  const yMin = Math.floor(Math.min(...values) * 10) / 10;
  const yMax = Math.ceil(Math.max(...values) * 10) / 10;
  const yTicks = Array.from(
    { length: Math.round((yMax - yMin) * 10) + 1 },
    (_, k) => Number((yMin + k / 10).toFixed(1)),
  );
  const xTicks = data.flatMap((d, i) =>
    i === 0 || i === last || d.epoch % 10 === 0 ? [{ i, epoch: d.epoch }] : [],
  );
  const xPct = (i: number) => (i / last) * 100;
  const yPct = (v: number) => (1 - (v - yMin) / (yMax - yMin)) * 100;
  const peakIdx = data.reduce(
    (best, d, i) => (d.map50 > data[best].map50 ? i : best),
    0,
  );

  const line = data
    .map(
      (d, i) =>
        `${i === 0 ? "M" : "L"}${(xPct(i) / 100) * VB_W},${(yPct(d.map50) / 100) * VB_H}`,
    )
    .join(" ");
  const area = `${line} L${VB_W},${VB_H} L0,${VB_H} Z`;

  // Scroll is the training clock: the plot's travel up the viewport maps to epochs, ending while
  // the whole plot is still on screen. Applied imperatively after mount, so the server render and
  // the first client render agree (epoch 1).
  const { scrollYProgress } = useScroll({
    target: plotRef,
    offset: ["start 85%", "start 25%"],
  });
  useEffect(() => {
    const apply = (p: number) => {
      const i = Math.round(p * last);
      const x = (i / last) * 100;
      const y = (1 - (data[i].map50 - yMin) / (yMax - yMin)) * 100;
      if (svgRef.current)
        svgRef.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
      if (headRef.current) {
        headRef.current.style.transform = `translate3d(${x}%, ${y}%, 0)`;
        headRef.current.dataset.side = x > 72 ? "left" : "right";
      }
      if (headTextRef.current)
        headTextRef.current.textContent = headText(data[i]);
      if (peakRef.current)
        peakRef.current.style.opacity = i >= peakIdx ? "1" : "0";
    };
    if (reduce) {
      apply(1);
      return;
    }
    apply(scrollYProgress.get());
    return scrollYProgress.on("change", apply);
  }, [reduce, scrollYProgress, data, last, peakIdx, yMin, yMax]);

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - box.left) / box.width) * last);
    setHover(Math.min(last, Math.max(0, i)));
  };

  return (
    <figure className="flex flex-col gap-4">
      <p className="font-mono text-[12px] text-ink-2">mAP@50 by epoch</p>

      <div
        ref={plotRef}
        className="relative aspect-[8/5] w-full touch-pan-y sm:aspect-[5/2]"
        onPointerMove={onPointer}
        onPointerLeave={() => setHover(null)}
        aria-hidden
      >
        {yTicks.map((t) => (
          <div
            key={t}
            className="absolute inset-x-0 border-t border-rule"
            style={{ top: `${yPct(t)}%` }}
          >
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
          <div
            className="absolute inset-x-0 border-t border-ink-3"
            style={{ top: `${yPct(reference.value)}%` }}
          >
            <span className="absolute right-0 top-1.5 max-w-[60%] text-right font-mono text-[11px] leading-4 text-ink-2">
              {reference.label}
            </span>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          <defs>
            <linearGradient id="curve-wash" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0"
                stopColor="var(--accent)"
                style={{ stopOpacity: "var(--wash)" }}
              />
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
          className="pointer-events-none absolute"
          style={{
            left: `${xPct(peakIdx)}%`,
            top: `${yPct(data[peakIdx].map50)}%`,
            opacity: 0,
          }}
        >
          <span className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent" />
          <span className="absolute bottom-3 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] leading-4">
            <span className="block font-semibold text-ink">
              Peak {fmt(data[peakIdx].map50)}
            </span>
            <span className="block text-ink-2">
              epoch {data[peakIdx].epoch}
            </span>
          </span>
        </div>

        {/* The drawing edge: a dot and a readout that ride the curve as it is drawn. The plot-sized
            layer moves by its own size, so a slightly larger clip keeps it from widening the page. */}
        <div className="pointer-events-none absolute -inset-4 overflow-hidden">
          <div
            ref={headRef}
            data-side="right"
            className="group absolute inset-4 will-change-transform"
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

        {hover !== null && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-ink/40"
              style={{ left: `${xPct(hover)}%` }}
            />
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

      <div
        aria-hidden
        className="relative h-3 font-mono text-[10px] leading-none tabular-nums text-ink-3"
      >
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
          {source}. Epoch {final.epoch}: precision {fmt(final.precision)},
          recall {fmt(final.recall)}, mAP@50-95 {fmt(final.map5095)}.
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
      <span className={strong ? "font-semibold text-ink" : "text-ink"}>
        {fmt(v)}
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
            {["Epoch", "mAP@50", "mAP@50-95", "Precision", "Recall"].map(
              (h) => (
                <th key={h} scope="col" className="px-3 py-2 font-normal">
                  {h}
                </th>
              ),
            )}
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
