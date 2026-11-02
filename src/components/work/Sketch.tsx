"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/data/projects";
import { FINE_POINTER, gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

type SketchKind = NonNullable<Project["sketch"]>;

const CELL = 9;
// Room for the longest row label ("context recall") in the evaluation sketch.
const EVAL_X = 104;
const GAP = 3;
const PITCH = CELL + GAP;

// Integer hash in [0, 1). Pure integer math, so the server and every browser draw the same pattern.
const hash = (a: number, b: number) => (Math.imul(a * 374761393 + b * 668265263, 1274126177) >>> 0) / 4294967296;

const CAPTIONS: Record<SketchKind, string> = {
  "order-flow": "Broker flow, read session by session, summed into a net line",
  "eval-grid": "Every answer scored on two metrics, every run",
  "causal-mask": "Causal attention, one token at a time, keys and values cached",
};

/**
 * A small drawing of how a project works. It is an illustration of the mechanism: no value in it
 * is data, which the label says. It plays on row hover, or once in view on touch screens.
 */
export function Sketch({ kind, active }: { kind: SketchKind; active: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const t = build(kind, ref.current!);
        t.progress(1).pause();
        tl.current = t;
        // Touch screens have no hover, so the sketch plays once as it scrolls in.
        if (!window.matchMedia(FINE_POINTER).matches) {
          ScrollTrigger.create({ trigger: ref.current, start: "top 85%", once: true, onEnter: () => t.restart() });
        }
        return () => {
          tl.current = null;
        };
      });
    },
    { scope: ref },
  );

  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    if (active) t.restart();
    else t.progress(1).pause();
  }, [active]);

  return (
    <figure aria-hidden className="flex flex-col gap-2">
      <svg
        ref={ref}
        viewBox={`0 0 ${VIEW[kind].w} ${VIEW[kind].h}`}
        width={VIEW[kind].w}
        height={VIEW[kind].h}
        className="max-w-full overflow-visible text-ink-3 transition-colors duration-300 group-hover/row:text-ink"
      >
        {kind === "order-flow" && <OrderFlow />}
        {kind === "eval-grid" && <EvalGrid />}
        {kind === "causal-mask" && <CausalMask />}
      </svg>
      <figcaption className="font-mono text-[10px] leading-4 text-ink-3">
        Schematic · {CAPTIONS[kind]}
      </figcaption>
    </figure>
  );
}

const VIEW: Record<SketchKind, { w: number; h: number }> = {
  "order-flow": { w: 14 * PITCH - GAP, h: 4 * PITCH + 30 },
  "eval-grid": { w: EVAL_X + 12 * PITCH - GAP, h: 2 * PITCH + 14 },
  "causal-mask": { w: 8 * PITCH + 52, h: 8 * PITCH - GAP },
};

// Brokers in rows, sessions in columns: mostly buying early (accumulation), mostly selling late.
const FLOW_COLS = 14;
const FLOW_ROWS = 4;
const flowBuy = (c: number, r: number) => hash(c + 1, r + 1) < (c < FLOW_COLS / 2 ? 0.78 : 0.22);
const flowNet = (() => {
  let run = 0;
  return Array.from({ length: FLOW_COLS }, (_, c) => {
    for (let r = 0; r < FLOW_ROWS; r++) run += flowBuy(c, r) ? 1 : -1;
    return run;
  });
})();

function OrderFlow() {
  const top = FLOW_ROWS * PITCH + 6;
  const lo = Math.min(0, ...flowNet);
  const hi = Math.max(0, ...flowNet);
  const y = (v: number) => top + 20 - ((v - lo) / (hi - lo || 1)) * 20;
  const points = flowNet.map((v, c) => `${c * PITCH + CELL / 2},${y(v)}`).join(" ");
  return (
    <>
      {Array.from({ length: FLOW_COLS }, (_, c) =>
        Array.from({ length: FLOW_ROWS }, (_, r) => (
          <rect
            key={`${c}-${r}`}
            data-col={c}
            x={c * PITCH + 0.5}
            y={r * PITCH + 0.5}
            width={CELL - 1}
            height={CELL - 1}
            fill={flowBuy(c, r) ? "currentColor" : "none"}
            stroke="currentColor"
          />
        )),
      )}
      <line x1={0} x2={FLOW_COLS * PITCH - GAP} y1={y(0)} y2={y(0)} stroke="currentColor" strokeOpacity={0.3} />
      <polyline data-net points={points} fill="none" stroke="currentColor" strokeWidth={1.5} pathLength={1} strokeDasharray="1" />
      <line data-sweep x1={0} x2={0} y1={-3} y2={FLOW_ROWS * PITCH} stroke="currentColor" strokeOpacity={0} />
    </>
  );
}

const EVAL_COLS = 12;
const EVAL_ROWS = ["faithfulness", "context recall"];

function EvalGrid() {
  return (
    <>
      {EVAL_ROWS.map((label, r) => (
        <text key={label} x={0} y={r * PITCH + CELL - 1} fontSize={9} className="font-mono" fill="currentColor">
          {label}
        </text>
      ))}
      {Array.from({ length: EVAL_COLS }, (_, c) =>
        EVAL_ROWS.map((label, r) => (
          <g key={`${c}-${label}`} transform={`translate(${EVAL_X + c * PITCH} ${r * PITCH})`}>
            <rect x={0.5} y={0.5} width={CELL - 1} height={CELL - 1} fill="none" stroke="currentColor" strokeOpacity={0.45} />
            <rect data-score data-col={c} x={2} y={2} width={CELL - 4} height={CELL - 4} fill="currentColor" />
          </g>
        )),
      )}
      <text x={EVAL_X} y={2 * PITCH + 10} fontSize={9} className="font-mono" fill="currentColor" fillOpacity={0.7}>
        q1
      </text>
      <text x={EVAL_X + EVAL_COLS * PITCH - GAP} y={2 * PITCH + 10} fontSize={9} textAnchor="end" className="font-mono" fill="currentColor" fillOpacity={0.7}>
        q{EVAL_COLS}
      </text>
    </>
  );
}

const TOKENS = 8;

function CausalMask() {
  const cacheX = TOKENS * PITCH + 18;
  return (
    <>
      {Array.from({ length: TOKENS }, (_, q) =>
        Array.from({ length: TOKENS }, (_, k) =>
          k <= q ? (
            <rect key={`${q}-${k}`} data-row={q} x={k * PITCH} y={q * PITCH} width={CELL} height={CELL} fill="currentColor" />
          ) : (
            <rect
              key={`${q}-${k}`}
              x={k * PITCH + 0.5}
              y={q * PITCH + 0.5}
              width={CELL - 1}
              height={CELL - 1}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.3}
            />
          ),
        ),
      )}
      {["K", "V"].map((label, j) => (
        <g key={label} transform={`translate(${cacheX + j * 16} 0)`}>
          {Array.from({ length: TOKENS }, (_, t) => (
            <rect key={t} data-cache={t} x={0} y={t * PITCH} width={CELL} height={CELL} fill="currentColor" />
          ))}
        </g>
      ))}
    </>
  );
}

// Timelines start from the empty frame; at rest they sit on their last frame.
function build(kind: SketchKind, svg: SVGSVGElement): gsap.core.Timeline {
  const q = (sel: string) => gsap.utils.toArray<SVGElement>(sel, svg);
  const tl = gsap.timeline({ paused: true });
  if (kind === "order-flow") {
    const span = FLOW_COLS * PITCH - GAP;
    tl.fromTo(q("[data-col]"), { opacity: 0.12 }, { opacity: 1, duration: 0.25, stagger: (i, el) => Number(el.dataset.col) * 0.09 }, 0)
      .fromTo(q("[data-net]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: FLOW_COLS * 0.09 + 0.25, ease: "none" }, 0)
      .fromTo(q("[data-sweep]"), { attr: { x1: 0, x2: 0 }, strokeOpacity: 0.8 }, { attr: { x1: span, x2: span }, duration: FLOW_COLS * 0.09 + 0.25, ease: "none" }, 0)
      .to(q("[data-sweep]"), { strokeOpacity: 0, duration: 0.3 });
  } else if (kind === "eval-grid") {
    tl.fromTo(
      q("[data-score]"),
      { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" },
      { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)", stagger: (i, el) => Number(el.dataset.col) * 0.11 + (i % 2) * 0.05 },
    );
  } else {
    tl.fromTo(q("[data-row]"), { opacity: 0.1 }, { opacity: 1, duration: 0.2, stagger: (i, el) => Number(el.dataset.row) * 0.22 + (i - (Number(el.dataset.row) * (Number(el.dataset.row) + 1)) / 2) * 0.025 }, 0)
      .fromTo(q("[data-cache]"), { opacity: 0.1 }, { opacity: 1, duration: 0.2, stagger: (i, el) => Number(el.dataset.cache) * 0.22 }, 0);
  }
  return tl;
}
