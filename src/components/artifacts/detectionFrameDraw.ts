/** Pure canvas drawing + fixed layout data for DetectionFrame. No React here —
 *  kept separate so the component file stays focused on effect wiring. */

import {
  type PathSegment,
  type PersonVariant,
  computePersonGeometry,
  personLegPath,
  personTorsoPath,
} from "./personGeometry";

export type { PersonVariant } from "./personGeometry";

/** Abstract silhouette an acquisition box locks onto. Normalized 0–1 to the canvas. */
export interface DetectionObject {
  label: string;
  confidence: number;
  /** Bounding box in normalized coordinates: x, y, width, height. */
  box: [number, number, number, number];
  /** rounded-rect | person — a PPE item's tight rect vs. a constructed
   *  human silhouette (head / tapered torso / gapped legs). */
  shape: "rect" | "person";
  /** Which PERSON_PROFILES entry draws this figure. Only meaningful when
   *  shape is "person" — gives the two figures distinct proportions/stance
   *  instead of reading as clones. */
  personVariant?: PersonVariant;
  /** Preferred label chip side. Tall "person" boxes default to below so
   *  their own chip doesn't start out fighting a nested item's chip above
   *  it — the real collision pass (see `resolveLabelRect`) handles the rest. */
  labelAnchor?: "above" | "below";
}

// Fixed, hand-tuned layout — deterministic, no Math.random(). Reads as a
// loose construction-site frame: a person plus the PPE items on them.
// Nested items (hard-hat/vest on a person) sit inside the person's box —
// that's intentional — the label collision pass keeps every chip clear of
// every box edge and every other chip regardless of the nesting.
//
// The hard-hat/helmet and vest boxes below are hand-derived from the
// PERSON_PROFILES fractions (see drawPersonPath) at the figure's actual
// rendered size (the 360×270 hero plate), so they land on the real head/
// torso rather than floating over empty silhouette. If PERSON_PROFILES
// changes, re-derive these two pairs of boxes to match.
export const OBJECTS: DetectionObject[] = [
  {
    label: "person",
    confidence: 0.94,
    box: [0.05, 0.14, 0.19, 0.66],
    shape: "person",
    personVariant: "a",
    labelAnchor: "below",
  },
  {
    label: "hard-hat",
    confidence: 0.89,
    box: [0.092, 0.146, 0.105, 0.14],
    shape: "rect",
  },
  {
    label: "vest",
    confidence: 0.91,
    box: [0.069, 0.294, 0.152, 0.16],
    shape: "rect",
    // "Above" would sit right across the neck gap between the hard-hat and
    // vest boxes and hide it — push the chip below instead.
    labelAnchor: "below",
  },
  {
    label: "person",
    confidence: 0.87,
    box: [0.58, 0.2, 0.18, 0.62],
    shape: "person",
    personVariant: "b",
    labelAnchor: "below",
  },
  {
    label: "helmet",
    confidence: 0.83,
    box: [0.621, 0.205, 0.097, 0.13],
    shape: "rect",
  },
  {
    label: "vest",
    confidence: 0.88,
    box: [0.618, 0.341, 0.122, 0.139],
    shape: "rect",
    labelAnchor: "below",
  },
];

// Per-object phase offset (0–1 of a cycle) so acquisitions read as a
// sequence, not a synchronized blink.
export const PHASE_OFFSETS = [0, 0.08, 0.14, 0.32, 0.4, 0.46];

// Longer than the 8s a 360px thumbnail needed: at hero size the acquisition
// reads as a slow scan instead of a flicker, and the held frames carry more
// of the cycle. The grid is now also the page's own ground, so a calmer
// loop keeps the two from competing.
export const CYCLE_MS = 12000;
export const MAX_DPR = 2;

const HOLD_END = 0.7; // boxes are fully acquired and held until this point in the cycle
const RELEASE_END = 0.82; // then fade out, leaving a beat of empty frame
const BRACKET_END = 0.12; // fraction of a single acquisition spent growing corner brackets
const STROKE_END = 0.22; // then the full rect stroke fades in
const LABEL_END = 0.32; // then the label chip slides in

export interface ThemeColors {
  ink: string;
  inkMuted: string;
  edge: string;
  raised: string;
  surfaceMuted: string;
}

export function readThemeColors(): ThemeColors {
  const styles = getComputedStyle(document.documentElement);
  return {
    ink: styles.getPropertyValue("--ink").trim() || "#111113",
    inkMuted: styles.getPropertyValue("--ink-muted").trim() || "#5d5d66",
    edge: styles.getPropertyValue("--edge").trim() || "#e4e4e8",
    raised: styles.getPropertyValue("--raised").trim() || "#ffffff",
    surfaceMuted: styles.getPropertyValue("--surface-muted").trim() || "#f0f0f2",
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace("#", "").trim();
  // getComputedStyle can hand back the browser's shortest serialization —
  // "#ffffff" round-trips as "#fff" — so 3-digit shorthand must expand
  // before slicing, or a channel silently reads as an out-of-range NaN.
  const clean = raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Ease-out for the acquisition sub-phases (brackets / stroke / label). */
function easeOutCubic(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 3);
}

/** Per-object envelope across a cycle: ramps up through the acquisition
 *  sub-phases, holds fully acquired, then releases — offset by phase. */
export function acquisitionProgress(cycleT: number, phaseOffset: number): number {
  const t = (cycleT + phaseOffset) % 1;
  if (t >= HOLD_END) {
    if (t >= RELEASE_END) return 0;
    const releaseT = (t - HOLD_END) / (RELEASE_END - HOLD_END);
    return 1 - releaseT;
  }
  return Math.min(1, t / LABEL_END);
}

// ---------------------------------------------------------------------------
// Label collision avoidance — a chip must never cross another box's edge or
// another chip. Every input here (box geometry, anchor preference, draw
// order) is fixed, so the resolved position is identical on every cycle.
// ---------------------------------------------------------------------------

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// A thin band around a box's edges — the region a label must not cross.
// Sitting entirely inside a sibling's fill (touching no edge) is tolerated;
// that's the nested-item-on-a-person case the layout intentionally allows.
const STROKE_BAND = 6;

function crossesBoxEdge(label: Rect, box: Rect): boolean {
  const outer: Rect = {
    x: box.x - STROKE_BAND,
    y: box.y - STROKE_BAND,
    w: box.w + STROKE_BAND * 2,
    h: box.h + STROKE_BAND * 2,
  };
  if (!rectsOverlap(label, outer)) return false;
  const inner: Rect = {
    x: box.x + STROKE_BAND,
    y: box.y + STROKE_BAND,
    w: Math.max(0, box.w - STROKE_BAND * 2),
    h: Math.max(0, box.h - STROKE_BAND * 2),
  };
  const fullyInsideFill =
    label.x >= inner.x &&
    label.x + label.w <= inner.x + inner.w &&
    label.y >= inner.y &&
    label.y + label.h <= inner.y + inner.h;
  return !fullyInsideFill;
}

const LABEL_NUDGES = [0, 10, -10, 20, -20, 32, -32];

/** Tries the preferred anchor, then the flipped anchor, then small
 *  horizontal nudges — first rect that clears every sibling box edge and
 *  every already-placed chip wins. Falls back to the preferred anchor,
 *  un-nudged, if nothing is fully clear. */
function resolveLabelRect(
  rectFor: (anchor: "above" | "below", dx: number) => Rect,
  preferred: "above" | "below",
  siblingBoxes: Rect[],
  placedLabels: Rect[]
): Rect {
  const anchors: Array<"above" | "below"> =
    preferred === "above" ? ["above", "below"] : ["below", "above"];
  for (const anchor of anchors) {
    for (const dx of LABEL_NUDGES) {
      const rect = rectFor(anchor, dx);
      const hitsBox = siblingBoxes.some((box) => crossesBoxEdge(rect, box));
      const hitsLabel = placedLabels.some((placed) => rectsOverlap(rect, placed));
      if (!hitsBox && !hitsLabel) return rect;
    }
  }
  return rectFor(preferred, 0);
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function boxRect(obj: DetectionObject, w: number, h: number): Rect {
  const [nx, ny, nw, nh] = obj.box;
  return { x: nx * w, y: ny * h, w: nw * w, h: nh * h };
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: ThemeColors
) {
  ctx.fillStyle = hexToRgba(colors.surfaceMuted, 0.4);
  ctx.fillRect(0, 0, w, h);

  const step = 28;
  ctx.strokeStyle = hexToRgba(colors.edge, 0.5);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = step; x < w; x += step) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = step; y < h; y += step) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();
  // No outer border here on purpose — the Reticle's four corner ticks are
  // the plate's only frame. A drawn border would compete with them.
}

// ---------------------------------------------------------------------------
// Person silhouette — geometry comes from personGeometry.ts (shared with the
// Computer Vision project thumbnail's SVG version). This file only adapts
// the resolved points into canvas path calls.
// ---------------------------------------------------------------------------

/** Issues canvas path calls for a medium-agnostic PathSegment list, without
 *  opening/closing/filling — the caller wraps this in a single
 *  beginPath()/fill() so a whole figure paints as one flat region. */
function applyPathSegments(ctx: CanvasRenderingContext2D, segments: PathSegment[]) {
  for (const seg of segments) {
    if (seg.type === "move") ctx.moveTo(seg.to.x, seg.to.y);
    else if (seg.type === "line") ctx.lineTo(seg.to.x, seg.to.y);
    else if (seg.type === "quad") ctx.quadraticCurveTo(seg.control.x, seg.control.y, seg.to.x, seg.to.y);
    else ctx.closePath();
  }
}

/** Adds a person silhouette's subpaths (head, torso+arms, two legs) to the
 *  current path without opening/closing/filling it — the caller wraps this
 *  in a single beginPath()/fill() so the whole figure paints as one flat
 *  region with no overlap seams. The head-to-shoulder neck gap and the
 *  left/right leg gap are the only intentional breaks in the silhouette. */
function drawPersonPath(ctx: CanvasRenderingContext2D, box: Rect, variant: PersonVariant) {
  const geo = computePersonGeometry(box, variant);

  // Head — its own closed subpath, separated from the torso by the neck
  // gap so it reads as a distinct mass rather than a rounded cap.
  ctx.moveTo(geo.head.cx + geo.head.r, geo.head.cy);
  ctx.arc(geo.head.cx, geo.head.cy, geo.head.r, 0, Math.PI * 2);

  applyPathSegments(ctx, personTorsoPath(geo));
  applyPathSegments(ctx, personLegPath(geo.legLeft));
  applyPathSegments(ctx, personLegPath(geo.legRight));
}

/** Faint scenery layer — deliberately much quieter than the annotation ink
 *  above it so boxes/brackets read as sitting *on top of* the frame. */
function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  obj: DetectionObject,
  box: Rect,
  colors: ThemeColors
) {
  // Every "rect" object here (hard-hat/helmet/vest) is a PPE item nested on
  // a person's own box, now re-anchored to the figure's actual head/torso.
  // Filling their own ghost rect on top of the figure would double-paint
  // that region — a seam right where the figure needs to read cleanest.
  // Their annotation box (brackets + stroke, drawn separately) is enough.
  if (obj.shape !== "person") return;
  ctx.fillStyle = hexToRgba(colors.inkMuted, 0.1);
  ctx.beginPath();
  drawPersonPath(ctx, box, obj.personVariant ?? "a");
  ctx.fill();
}

/** Corner brackets + full rect stroke — the crisp annotation layer. */
function drawBoxMarks(
  ctx: CanvasRenderingContext2D,
  box: Rect,
  colors: ThemeColors,
  progress: number
) {
  if (progress <= 0) return;
  const { x, y, w: bw, h: bh } = box;
  const armLen = Math.min(14, bw / 3, bh / 3);

  const bracketT = easeOutCubic(progress / BRACKET_END);
  const strokeT = easeOutCubic((progress - BRACKET_END) / (STROKE_END - BRACKET_END));

  // Corner brackets grow in first.
  if (bracketT > 0) {
    ctx.strokeStyle = hexToRgba(colors.ink, 0.92);
    ctx.lineWidth = 1.5;
    const len = armLen * bracketT;
    const corners: [number, number, number, number][] = [
      [x, y, 1, 1],
      [x + bw, y, -1, 1],
      [x, y + bh, 1, -1],
      [x + bw, y + bh, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + len * dy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + len * dx, cy);
      ctx.stroke();
    }
  }

  // Full rect stroke fades in — held well clear of the silhouette's alpha
  // so the box reads as annotation, not more scenery.
  if (strokeT > 0) {
    ctx.strokeStyle = hexToRgba(colors.ink, 0.55 * strokeT);
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1);
  }
}

/** Resolves a collision-free rest position and draws the label chip,
 *  sliding in from the left as it fades. Returns the resolved rect so the
 *  caller can register it against the next chip's collision pass. */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  obj: DetectionObject,
  box: Rect,
  colors: ThemeColors,
  labelT: number,
  siblingBoxes: Rect[],
  placedLabels: Rect[],
  /** Plate width in CSS px — chip type and padding scale with it so the
   *  annotation layer reads at hero size without going giant on a 220px
   *  project thumbnail. Clamped: below ~0.9 the text stops being legible. */
  plateWidth: number
): Rect {
  const scale = Math.min(1.6, Math.max(0.9, plateWidth / 420));
  ctx.font = `${Math.round(10 * scale)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  const text = `${obj.label} ${obj.confidence.toFixed(2)}`;
  const paddingX = 6 * scale;
  const chipH = 16 * scale;
  const chipW = ctx.measureText(text).width + paddingX * 2;

  const rectFor = (anchor: "above" | "below", dx: number): Rect => ({
    x: box.x + box.w / 2 - chipW / 2 + dx,
    y: anchor === "below" ? box.y + box.h + 4 : box.y - chipH - 4,
    w: chipW,
    h: chipH,
  });

  const rest = resolveLabelRect(
    rectFor,
    obj.labelAnchor ?? "above",
    siblingBoxes,
    placedLabels
  );

  const slideFrom = -8;
  const chipX = rest.x + slideFrom * (1 - labelT);
  const chipY = rest.y;

  ctx.globalAlpha = labelT;
  ctx.fillStyle = hexToRgba(colors.raised, 0.95);
  ctx.strokeStyle = hexToRgba(colors.edge, 1);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = hexToRgba(colors.ink, 0.92);
  ctx.textBaseline = "middle";
  ctx.fillText(text, chipX + paddingX, chipY + chipH / 2 + 0.5);
  ctx.globalAlpha = 1;

  return rest;
}

/** Draws every object's silhouette + box marks, then every visible label in
 *  a second pass so labels can be placed against the full, final set of box
 *  rects and each other. `progressFor` supplies each object's acquisition
 *  progress by index — time-based for the live loop, constant for the
 *  reduced-motion static frame. */
function renderObjects(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: ThemeColors,
  progressFor: (index: number) => number
) {
  const boxRects = OBJECTS.map((obj) => boxRect(obj, w, h));

  OBJECTS.forEach((obj, i) => {
    drawSilhouette(ctx, obj, boxRects[i], colors);
    drawBoxMarks(ctx, boxRects[i], colors, progressFor(i));
  });

  const placedLabels: Rect[] = [];
  OBJECTS.forEach((obj, i) => {
    const progress = progressFor(i);
    const labelT = easeOutCubic((progress - STROKE_END) / (LABEL_END - STROKE_END));
    if (labelT <= 0) return;
    const siblingBoxes = boxRects.filter((_, j) => j !== i);
    const rect = drawLabel(
      ctx,
      obj,
      boxRects[i],
      colors,
      labelT,
      siblingBoxes,
      placedLabels,
      w
    );
    placedLabels.push(rect);
  });
}

/** Draws the grid plate and every object at the given cycle position (0–1). */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: ThemeColors,
  cycleT: number
) {
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h, colors);
  renderObjects(ctx, w, h, colors, (i) => acquisitionProgress(cycleT, PHASE_OFFSETS[i]));
}

/** Reduced-motion fallback: every box fully acquired and held, no timing. */
export function drawStaticFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: ThemeColors
) {
  drawGrid(ctx, w, h, colors);
  renderObjects(ctx, w, h, colors, () => 1);
}
