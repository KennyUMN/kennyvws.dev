"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/data/projects";
import { FINE_POINTER, gsap, MOTION_OK, ScrollTrigger } from "@/lib/gsap";
import { useIdleGSAP } from "@/hooks/useIdleGSAP";

type SketchKind = NonNullable<Project["sketch"]>;

const CELL = 9;
// Room for the longest row label ("context recall") in the evaluation sketch.
const EVAL_X = 104;
const GAP = 3;
const PITCH = CELL + GAP;

// Integer hash in [0, 1). Pure integer math, so the server and every browser draw the same pattern.
const hash = (a: number, b: number) => (Math.imul(a * 374761393 + b * 668265263, 1274126177) >>> 0) / 4294967296;

const CAPTIONS: Record<SketchKind, string> = {
  "agent-loop": "The model proposes a call, the gate checks it, the tool result returns to the model",
  "rank-fusion": "Two rankings of the same memories, merged by reciprocal rank fusion",
  "order-flow": "Broker summaries read session by session, accumulation then distribution",
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

  useIdleGSAP(
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
    ref,
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
        {kind === "agent-loop" && <AgentLoop />}
        {kind === "rank-fusion" && <RankFusion />}
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

// The agent loop as a circuit: three stages on a wire, and a return wire that closes the loop.
const NODES = ["model", "gate", "tool"];
const NODE_W = 44;
const NODE_H = 16;
const NODE_STEP = 72;
const LOOP_Y = 34;
const PACKET = 6;
const LAPS = 2;
// Seconds: the wait inside a stage, one hop between stages, and the two legs of the return wire.
const LOOP_PAUSE = 0.1;
const LOOP_HOP = 0.18;
const LOOP_DROP = 0.08;
const LOOP_BACK = 0.3;
const nodeMid = (i: number) => i * NODE_STEP + NODE_W / 2;

function AgentLoop() {
  const wireY = NODE_H / 2;
  const back = `${nodeMid(2)},${NODE_H} ${nodeMid(2)},${LOOP_Y} ${nodeMid(0)},${LOOP_Y} ${nodeMid(0)},${NODE_H}`;
  return (
    <>
      {NODES.map((label, i) => (
        <g key={label} transform={`translate(${i * NODE_STEP} 0)`}>
          <rect data-node={i} x={0.5} y={0.5} width={NODE_W - 1} height={NODE_H - 1} fill="currentColor" fillOpacity={0} stroke="currentColor" />
          <text x={NODE_W / 2} y={NODE_H - 5} fontSize={9} textAnchor="middle" className="font-mono" fill="currentColor">
            {label}
          </text>
        </g>
      ))}
      {[0, 1].map((i) => {
        const end = (i + 1) * NODE_STEP;
        return (
          <g key={i} fill="none" stroke="currentColor" strokeOpacity={0.5}>
            <line x1={i * NODE_STEP + NODE_W} x2={end} y1={wireY} y2={wireY} />
            <polyline points={`${end - 4},${wireY - 3} ${end},${wireY} ${end - 4},${wireY + 3}`} />
          </g>
        );
      })}
      <polyline points={back} fill="none" stroke="currentColor" strokeOpacity={0.5} />
      <polyline
        points={`${nodeMid(0) - 3},${NODE_H + 4} ${nodeMid(0)},${NODE_H} ${nodeMid(0) + 3},${NODE_H + 4}`}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.5}
      />
      <rect data-packet x={-PACKET / 2} y={-PACKET / 2} width={PACKET} height={PACKET} fill="currentColor" opacity={0} />
    </>
  );
}

// Five memories, told apart by bar length, ranked twice. The fused order is real reciprocal rank
// fusion over the two lists, with the usual constant of 60.
const LIST_N = 5;
const LIST_TOP = 16;
const LIST_X = [0, 62, 136];
const BAR_H = 7;
const BAR_MAX = 34;
const RRF_K = 60;
const barW = (item: number) => 10 + item * 6;
const RANKED = [
  [2, 0, 4, 1, 3],
  [0, 3, 2, 4, 1],
];
const FUSED = Array.from({ length: LIST_N }, (_, item) => item)
  .map((item) => ({ item, score: RANKED.reduce((sum, list) => sum + 1 / (RRF_K + list.indexOf(item) + 1), 0) }))
  .sort((a, b) => b.score - a.score)
  .map((entry) => entry.item);

function RankFusion() {
  const mid = LIST_TOP + (LIST_N * PITCH - GAP) / 2 + 3;
  const lists = [...RANKED, FUSED];
  return (
    <>
      {["BM25", "dense", "fused"].map((label, l) => (
        <text key={label} x={LIST_X[l]} y={8} fontSize={9} className="font-mono" fill="currentColor">
          {label}
        </text>
      ))}
      {["+", "="].map((sign, l) => (
        <text key={sign} x={(LIST_X[l] + BAR_MAX + LIST_X[l + 1]) / 2} y={mid} fontSize={9} textAnchor="middle" className="font-mono" fill="currentColor" fillOpacity={0.7}>
          {sign}
        </text>
      ))}
      {lists.map((list, l) =>
        list.map((item, rank) => (
          <rect
            key={`${l}-${item}`}
            {...(l === 2 ? { "data-fused": RANKED[0].indexOf(item) - rank } : { "data-ranked": l, "data-rank": rank })}
            x={LIST_X[l] + 0.5}
            y={LIST_TOP + rank * PITCH + 0.5}
            width={barW(item) - 1}
            height={BAR_H - 1}
            fill="currentColor"
            fillOpacity={l === 2 ? 1 : 0}
            stroke="currentColor"
          />
        )),
      )}
    </>
  );
}

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

const VIEW: Record<SketchKind, { w: number; h: number }> = {
  "agent-loop": { w: 2 * NODE_STEP + NODE_W, h: LOOP_Y + 1 },
  "rank-fusion": { w: LIST_X[2] + BAR_MAX, h: LIST_TOP + LIST_N * PITCH - GAP },
  "order-flow": { w: 14 * PITCH - GAP, h: 4 * PITCH + 30 },
  "eval-grid": { w: EVAL_X + 12 * PITCH - GAP, h: 2 * PITCH + 14 },
  "causal-mask": { w: 8 * PITCH + 52, h: 8 * PITCH - GAP },
};

// Timelines start from the empty frame; at rest they sit on their last frame.
function build(kind: SketchKind, svg: SVGSVGElement): gsap.core.Timeline {
  const q = (sel: string) => gsap.utils.toArray<SVGElement>(sel, svg);
  const tl = gsap.timeline({ paused: true });
  if (kind === "agent-loop") {
    // The packet shows on the wires only. Each stage lights as the packet reaches it.
    const packet = q("[data-packet]");
    const nodes = q("[data-node]");
    const wireY = NODE_H / 2;
    const flash = (i: number, at: number) =>
      tl.fromTo(nodes[i], { fillOpacity: 0.35 }, { fillOpacity: 0, duration: 0.45, immediateRender: false }, at);
    let t = 0;
    for (let lap = 0; lap < LAPS; lap++) {
      flash(0, t);
      for (const from of [0, 1]) {
        t += LOOP_PAUSE;
        tl.set(packet, { opacity: 1, x: from * NODE_STEP + NODE_W + PACKET / 2, y: wireY }, t).to(
          packet,
          { x: (from + 1) * NODE_STEP - PACKET / 2, duration: LOOP_HOP, ease: "none" },
          t,
        );
        t += LOOP_HOP;
        tl.set(packet, { opacity: 0 }, t);
        flash(from + 1, t);
      }
      t += LOOP_PAUSE;
      tl.set(packet, { opacity: 1, x: nodeMid(2), y: NODE_H + PACKET / 2 }, t)
        .to(packet, { y: LOOP_Y, duration: LOOP_DROP, ease: "none" }, t)
        .to(packet, { x: nodeMid(0), duration: LOOP_BACK, ease: "none" }, t + LOOP_DROP)
        .to(packet, { y: NODE_H + PACKET / 2, duration: LOOP_DROP, ease: "none" }, t + LOOP_DROP + LOOP_BACK);
      t += 2 * LOOP_DROP + LOOP_BACK;
      tl.set(packet, { opacity: 0 }, t);
    }
    flash(0, t);
  } else if (kind === "rank-fusion") {
    // Both lists rank in from the top, then each fused bar leaves its keyword rank for its fused rank.
    const fused = q("[data-fused]");
    tl.fromTo(
      q("[data-ranked]"),
      { scaleX: 0, transformOrigin: "0% 50%" },
      { scaleX: 1, duration: 0.25, stagger: (_, el) => Number(el.dataset.rank) * 0.07 + Number(el.dataset.ranked) * 0.2 },
      0,
    )
      .fromTo(fused, { opacity: 0, y: (_, el) => Number(el.dataset.fused) * PITCH }, { opacity: 1, duration: 0.2 }, 0.75)
      .to(fused, { y: 0, duration: 0.5, ease: "power2.inOut", stagger: 0.05 });
  } else if (kind === "order-flow") {
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
