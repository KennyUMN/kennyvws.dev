"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ProjectCategory } from "@/data/projects";
import { DUR_BASE, EASE_OUT_SOFT } from "@/lib/motion";
import {
  type Box,
  type PathSegment,
  computePersonGeometry,
  personBoundingBoxes,
  personLegPath,
  personTorsoPath,
} from "./personGeometry";
import { Reticle } from "./Reticle";
import { SignalTrace } from "./SignalTrace";
import { TokenStream } from "./TokenStream";

interface ProjectArtifactProps {
  category: ProjectCategory;
  /** 0-based position in the projects list — the hero owns FIG. 01, so
   *  figures here continue the sequence from 02. */
  index: number;
  /** Used only for deterministic SignalTrace curve-shape variation. */
  title: string;
  kind?: string;
  caption?: string;
  className?: string;
}

/** Deterministic two-way split derived from the title — not the list
 *  position, so two same-category rows never collide by index parity. */
function titleParity(title: string): 0 | 1 {
  const sum = [...title].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (sum % 2) as 0 | 1;
}

const SUFFIX: Record<ProjectCategory, string> = {
  "Computer Vision": "DETECT",
  "LLM / Agents": "STREAM",
  "ML Systems": "TRACE",
};

// --- Computer Vision: a lightweight looping acquisition diagram -----------
const ACQUISITION: Variants = {
  acquired: { opacity: 1, scale: 1, transition: { duration: 0 } },
  cycle: (delay: number) => ({
    opacity: [0, 1, 1, 0, 0],
    scale: [0.94, 1, 1, 0.98, 0.94],
    transition: {
      duration: 4,
      times: [0, 0.2, 0.825, 0.95, 1],
      ease: EASE_OUT_SOFT,
      delay,
      repeat: Infinity,
      repeatDelay: 2,
    },
  }),
};

// Deliberately not the hero's canvas — a lightweight SVG version of the same
// visual language: the same constructed person silhouette (geometry shared
// with the hero via personGeometry.ts, translated to SVG path commands
// instead of canvas calls), corner-bracket boxes, mono label chips, real
// class names — not the hero's "person"/"hard-hat"/"vest" duplicated, but
// the same vocabulary so the two plates don't look like different systems.
//
// Only the outer "person" box gets a label chip. At this plate size three
// chips next to a centered figure either overflow the frame or force
// illegibly small text — the hero doesn't have that constraint (it has a
// whole 360×270 canvas and two figures' worth of width to spread labels
// across). The nested helmet/vest boxes still draw with the same
// brackets + stroke as the hero's nested items; the boxes alone carry the
// meaning here, the same way the hero's boxes do before their own chips
// finish sliding in.
const THUMB_VIEWBOX_W = 200;
const THUMB_VIEWBOX_H = 150;
const THUMB_PERSON_BOX: Box = { x: 80, y: 14, w: 40, h: 106 };
const THUMB_BOX_MARGIN = 2;
const CORNER_ARM = 9;

function cornerPath(x: number, y: number, dx: 1 | -1, dy: 1 | -1): string {
  return `M ${x} ${y + CORNER_ARM * dy} L ${x} ${y} L ${x + CORNER_ARM * dx} ${y}`;
}

function boxCorners(box: Box): string[] {
  const { x, y, w, h } = box;
  return [
    cornerPath(x, y, 1, 1),
    cornerPath(x + w, y, -1, 1),
    cornerPath(x, y + h, 1, -1),
    cornerPath(x + w, y + h, -1, -1),
  ];
}

/** Converts a medium-agnostic path (see personGeometry.ts) into an SVG path
 *  `d` string — the canvas renderer converts the same segments into
 *  `ctx.moveTo`/`quadraticCurveTo`/`lineTo` calls instead. Same points,
 *  same shape, two native drawing APIs. */
function segmentsToSvgPath(segments: PathSegment[]): string {
  return segments
    .map((seg) => {
      if (seg.type === "move") return `M ${seg.to.x} ${seg.to.y}`;
      if (seg.type === "line") return `L ${seg.to.x} ${seg.to.y}`;
      if (seg.type === "quad") {
        return `Q ${seg.control.x} ${seg.control.y} ${seg.to.x} ${seg.to.y}`;
      }
      return "Z";
    })
    .join(" ");
}

interface ThumbDetection {
  box: Box;
  /** Only the outer "person" box carries a chip — see the note above on
   *  why the nested helmet/vest boxes stay unlabeled at this size. */
  chip?: { label: string; confidence: number };
}

function DetectionDiagram() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const reducedMotionValue = useReducedMotion();
  const reducedMotion = !mounted || reducedMotionValue;
  const geo = computePersonGeometry(THUMB_PERSON_BOX, "a");
  const { person, head, torso } = personBoundingBoxes(geo, THUMB_BOX_MARGIN);
  const torsoPath = segmentsToSvgPath(personTorsoPath(geo));
  const legLeftPath = segmentsToSvgPath(personLegPath(geo.legLeft));
  const legRightPath = segmentsToSvgPath(personLegPath(geo.legRight));

  const detections: ThumbDetection[] = [
    { box: head },
    { box: torso },
    { box: person, chip: { label: "person", confidence: 0.95 } },
  ];

  return (
    <svg
      viewBox={`0 0 ${THUMB_VIEWBOX_W} ${THUMB_VIEWBOX_H}`}
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* Silhouette — faint scenery, same as the hero: fill only, no
          stroke, quiet under the annotation layer above it. */}
      <g className="fill-ink-muted/10">
        <circle cx={geo.head.cx} cy={geo.head.cy} r={geo.head.r} />
        <path d={torsoPath} />
        <path d={legLeftPath} />
        <path d={legRightPath} />
      </g>

      {detections.map((d, i) => {
        const text = d.chip ? `${d.chip.label} ${d.chip.confidence.toFixed(2)}` : null;
        const chipW = text ? text.length * 5.6 + 14 : 0;
        const chipH = 16;
        const chipX = d.box.x + d.box.w / 2 - chipW / 2;
        const chipY = d.box.y + d.box.h + 6;
        return (
          <motion.g
            key={`${d.box.x}-${d.box.y}`}
            initial={false}
            variants={ACQUISITION}
            custom={i * 0.18}
            animate={reducedMotion ? "acquired" : "cycle"}
          >
            <rect
              x={d.box.x + 0.5}
              y={d.box.y + 0.5}
              width={d.box.w - 1}
              height={d.box.h - 1}
              fill="none"
              className="stroke-ink/55"
              strokeWidth={1}
            />
            {boxCorners(d.box).map((path, ci) => (
              <path
                key={ci}
                d={path}
                fill="none"
                className="stroke-ink"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            ))}
            {text && (
              <motion.g
                initial={false}
                animate={reducedMotion ? { opacity: 1 } : { opacity: [0, 0, 1, 1, 0, 0] }}
                transition={reducedMotion ? { duration: 0 } : {
                  duration: 4, times: [0, 0.14, 0.24, 0.825, 0.95, 1],
                  delay: i * 0.18, repeat: Infinity, repeatDelay: 2, ease: EASE_OUT_SOFT,
                }}
              >
                <rect
                  x={chipX}
                  y={chipY}
                  width={chipW}
                  height={chipH}
                  rx={2}
                  className="fill-raised stroke-edge"
                  strokeWidth={1}
                />
                <text
                  x={chipX + 6}
                  y={chipY + chipH / 2 + 0.5}
                  dominantBaseline="middle"
                  className="fill-ink font-mono text-[9px] tracking-wide"
                >
                  {text}
                </text>
              </motion.g>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

const CANDLES = [
  { path: "M40 140v-50M35 122h10", x: 32, y: 112, height: 26 },
  { path: "M75 110v-46M70 92h10", x: 67, y: 82, height: 30 },
  { path: "M110 96v-42M105 78h10", x: 102, y: 66, height: 22 },
  { path: "M145 84v-44M140 66h10", x: 137, y: 58, height: 26 },
  { path: "M180 70v-40M175 54h10", x: 172, y: 46, height: 20 },
  { path: "M215 58v-36M210 44h10", x: 207, y: 38, height: 18 },
  { path: "M250 52v-34M245 38h10", x: 242, y: 32, height: 16 },
];

function MarketFlowDiagram() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const reducedMotionValue = useReducedMotion();
  const reducedMotion = mounted && reducedMotionValue;
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true" focusable="false">
      <path d="M0 40H300M0 80H300M0 120H300M0 160H300" className="stroke-edge" strokeWidth={0.5} opacity={0.7} />
      <g className="stroke-ink" strokeWidth={1}>
        {CANDLES.map((candle, i) => (
          <motion.g
            key={candle.x}
            style={{ originY: 1, transformBox: "fill-box" }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={reducedMotion ? { opacity: 1, scaleY: 1 } : undefined}
            whileInView={reducedMotion ? undefined : { opacity: 1, scaleY: 1 }}
            viewport={{ once: true, margin: "-64px 0px" }}
            transition={reducedMotion ? { duration: 0 } : { duration: DUR_BASE, ease: EASE_OUT_SOFT, delay: i * 0.12 }}
          >
            <motion.g
              initial={false}
              whileInView={mounted && !reducedMotion && i >= CANDLES.length - 3 ? { opacity: [1, 0.8, 1] } : { opacity: 1 }}
              viewport={{ once: true }}
              transition={mounted && !reducedMotion ? { duration: 3, repeat: Infinity, delay: DUR_BASE + i * 0.12, ease: "easeInOut" } : { duration: 0 }}
            >
              <path d={candle.path} fill="none" />
              <rect x={candle.x} y={candle.y} width={16} height={candle.height}
                fill={i % 2 ? "none" : undefined} className={i % 2 ? undefined : "fill-ink"} opacity={i % 2 ? 1 : 0.8} />
            </motion.g>
          </motion.g>
        ))}
      </g>
      <text x="8" y="192" className="fill-ink-muted font-mono text-[8.5px]">ACCUMULATION / DISTRIBUTION FLOW</text>
    </svg>
  );
}

/** Maps a project's category to its inline evidence artifact, wrapped in the
 *  site's signature Reticle frame so the motif repeats down the work list. */
export function ProjectArtifact({ category, index, title, kind, caption, className }: ProjectArtifactProps) {
  const label = `FIG. ${String(index + 2).padStart(2, "0")} — ${kind === "market-data flow" ? "MARKET" : SUFFIX[category]}${kind ? ` · ${kind}` : ""}`;

  let content: React.ReactNode;
  switch (category) {
    case "ML Systems":
      content = kind === "market-data flow"
        ? <MarketFlowDiagram />
        : <SignalTrace static={kind === "training-loss trace"} variant={titleParity(title) === 0 ? "smooth" : "noisy"} />;
      break;
    case "LLM / Agents":
      content = <TokenStream caption={caption} />;
      break;
    case "Computer Vision":
      content = <DetectionDiagram />;
      break;
  }

  return (
    <>
      <Reticle label={label} className={className}>
        <div
          data-testid="project-artifact"
          className="aspect-[4/3] w-full overflow-hidden bg-raised"
        >
          {content}
        </div>
      </Reticle>
      {(category === "ML Systems" || category === "LLM / Agents") && (
        <p className="mt-1.5 font-mono text-[10px] tracking-wide text-ink-muted">
          ILLUSTRATIVE — NOT PROJECT OUTPUT
        </p>
      )}
    </>
  );
}
