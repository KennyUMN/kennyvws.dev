"use client";

import { motion } from "motion/react";
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
  /** Used only to deterministically vary SignalTrace's curve shape so two
   *  ML Systems rows never render as identical plates. */
  title: string;
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

// --- Computer Vision: a small static detection diagram --------------------
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
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-64px 0px" }}
            transition={{ duration: DUR_BASE, ease: EASE_OUT_SOFT, delay: i * 0.12 }}
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
              <>
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
              </>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

/** Maps a project's category to its inline evidence artifact, wrapped in the
 *  site's signature Reticle frame so the motif repeats down the work list. */
export function ProjectArtifact({ category, index, title, className }: ProjectArtifactProps) {
  const label = `FIG. ${String(index + 2).padStart(2, "0")} — ${SUFFIX[category]}`;

  let content: React.ReactNode;
  switch (category) {
    case "ML Systems":
      content = <SignalTrace variant={titleParity(title) === 0 ? "smooth" : "noisy"} />;
      break;
    case "LLM / Agents":
      content = <TokenStream />;
      break;
    case "Computer Vision":
      content = <DetectionDiagram />;
      break;
  }

  return (
    <Reticle label={label} className={className}>
      <div
        data-testid="project-artifact"
        className="aspect-[4/3] w-full overflow-hidden bg-raised"
      >
        {content}
      </div>
    </Reticle>
  );
}
