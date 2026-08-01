/** Medium-agnostic geometry for the "person" pictogram used by both the
 *  hero's canvas plate (DetectionFrame) and the Computer Vision project
 *  thumbnail (ProjectArtifact). Pure math only — no canvas or DOM APIs —
 *  so canvas and SVG can each translate the same resolved points into their
 *  own native drawing calls instead of hand-duplicating the shape twice.
 *
 *  A figure is: a circle head separated from the torso by a neck gap, a
 *  tapered torso+arms outline with rounded shoulder corners and a top edge
 *  that falls away toward each shoulder (not a flat slab), and two tapered
 *  legs with a gap between them. Every measurement is a fraction of the
 *  target box's own width/height, so it scales with whatever box a caller
 *  supplies — a 360×270 canvas box or a small SVG viewBox box alike. */

export type PersonVariant = "a" | "b";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

interface PersonProfile {
  headDiamF: number; // head circle diameter, fraction of box height
  headTopF: number; // head top inset from box top, fraction of box height
  neckGapF: number; // gap between head and shoulders, fraction of box height
  torsoHF: number; // shoulder-peak to waist height, fraction of box height
  hipDropF: number; // waist-to-hip height, fraction of box height
  shoulderHalfWF: number; // half-width at shoulders, fraction of box width
  waistHalfWF: number; // half-width at waist, fraction of box width
  hipHalfWF: number; // half-width at hip (leg attach), fraction of box width
  shoulderDropLF: number; // left shoulder tip drop below the neck peak, fraction of box height
  shoulderDropRF: number; // right shoulder tip drop below the neck peak, fraction of box height
  shoulderCornerRF: number; // shoulder-tip rounding radius, fraction of box width
  legGapF: number; // gap between legs at the hip, fraction of box width
  ankleHalfWF: number; // each leg's half-width at the ankle, fraction of box width
  stanceOffsetF: number; // shoulder span's horizontal drift, fraction of box width — 0 is frontal
}

export const PERSON_PROFILES: Record<PersonVariant, PersonProfile> = {
  // Squarer-shouldered, frontal, symmetric fall-away.
  a: {
    headDiamF: 0.19,
    headTopF: 0.02,
    neckGapF: 0.035,
    torsoHF: 0.22,
    hipDropF: 0.045,
    shoulderHalfWF: 0.4,
    waistHalfWF: 0.26,
    hipHalfWF: 0.28,
    shoulderDropLF: 0.025,
    shoulderDropRF: 0.025,
    shoulderCornerRF: 0.16,
    legGapF: 0.11,
    ankleHalfWF: 0.11,
    stanceOffsetF: 0,
  },
  // Narrower, turned: the shoulder span drifts right of the hips, and the
  // right shoulder falls away more than the left — both always measured
  // down from the same neck peak, so neither side can rise back above it.
  b: {
    headDiamF: 0.185,
    headTopF: 0.02,
    neckGapF: 0.035,
    torsoHF: 0.2,
    hipDropF: 0.04,
    shoulderHalfWF: 0.34,
    waistHalfWF: 0.2,
    hipHalfWF: 0.22,
    shoulderDropLF: 0.015,
    shoulderDropRF: 0.05,
    shoulderCornerRF: 0.18,
    legGapF: 0.09,
    ankleHalfWF: 0.085,
    stanceOffsetF: 0.05,
  },
};

// Hip<->waist side curve bulge — a fixed small constant rather than a
// per-profile field since it's a subtle "not a plain rectangle" detail,
// not something either figure needs to vary.
const SIDE_BULGE_F = 0.045;

export interface PersonTorsoGeometry {
  hipL: Point;
  waistL: Point;
  shoulderTipL: Point;
  peak: Point;
  shoulderTipR: Point;
  waistR: Point;
  hipR: Point;
  cornerR: number;
  sideBulge: number;
}

export interface PersonLegGeometry {
  hipOuter: Point;
  hipInner: Point;
  ankleInner: Point;
  ankleOuter: Point;
}

export interface PersonGeometry {
  head: { cx: number; cy: number; r: number };
  torso: PersonTorsoGeometry;
  legLeft: PersonLegGeometry;
  legRight: PersonLegGeometry;
}

/** Resolves a profile's fractions against an actual box into concrete
 *  points. Pure — same inputs always produce the same outputs. */
export function computePersonGeometry(box: Box, variant: PersonVariant): PersonGeometry {
  const { x, y, w: bw, h: bh } = box;
  const p = PERSON_PROFILES[variant];
  const cx = x + bw / 2;

  const rHead = (bh * p.headDiamF) / 2;
  const headTopY = y + bh * p.headTopF;
  const headCenterY = headTopY + rHead;
  const headBottomY = headTopY + rHead * 2;

  const shoulderPeakY = headBottomY + bh * p.neckGapF;
  const waistY = shoulderPeakY + bh * p.torsoHF;
  const hipY = waistY + bh * p.hipDropF;
  const feetY = y + bh * 0.98;

  const offset = bw * p.stanceOffsetF;
  const peakX = cx + offset;
  const shL = peakX - bw * p.shoulderHalfWF;
  const shR = peakX + bw * p.shoulderHalfWF;
  const shLTipY = shoulderPeakY + bh * p.shoulderDropLF;
  const shRTipY = shoulderPeakY + bh * p.shoulderDropRF;

  const waL = cx - bw * p.waistHalfWF;
  const waR = cx + bw * p.waistHalfWF;
  const hiL = cx - bw * p.hipHalfWF;
  const hiR = cx + bw * p.hipHalfWF;

  const legGapHalf = (bw * p.legGapF) / 2;
  const ankleHalf = bw * p.ankleHalfWF;
  const legDrift = offset * 0.4;

  const leftCenterX = (hiL + (cx - legGapHalf)) / 2 + legDrift;
  const rightCenterX = (hiR + (cx + legGapHalf)) / 2 + legDrift;

  return {
    head: { cx, cy: headCenterY, r: rHead },
    torso: {
      hipL: { x: hiL, y: hipY },
      waistL: { x: waL, y: waistY },
      shoulderTipL: { x: shL, y: shLTipY },
      peak: { x: peakX, y: shoulderPeakY },
      shoulderTipR: { x: shR, y: shRTipY },
      waistR: { x: waR, y: waistY },
      hipR: { x: hiR, y: hipY },
      cornerR: bw * p.shoulderCornerRF,
      sideBulge: bw * SIDE_BULGE_F,
    },
    legLeft: {
      hipOuter: { x: hiL, y: hipY },
      hipInner: { x: cx - legGapHalf, y: hipY },
      ankleInner: { x: leftCenterX + ankleHalf, y: feetY },
      ankleOuter: { x: leftCenterX - ankleHalf, y: feetY },
    },
    legRight: {
      hipOuter: { x: hiR, y: hipY },
      hipInner: { x: cx + legGapHalf, y: hipY },
      ankleInner: { x: rightCenterX - ankleHalf, y: feetY },
      ankleOuter: { x: rightCenterX + ankleHalf, y: feetY },
    },
  };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pullBack(from: Point, toward: Point, dist: number): Point {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: from.x + (dx / len) * dist, y: from.y + (dy / len) * dist };
}

/** The two points a quadratic Bezier — using `corner` itself as the control
 *  point — should run between to round that corner. Radius is clamped to
 *  half of whichever adjacent edge is shorter so the rounding can never
 *  overshoot past a neighboring vertex and fold the path back over itself.
 *  Works identically for canvas (`quadraticCurveTo`) and SVG (`Q`) since
 *  both take the same three points. */
function roundCorner(prev: Point, corner: Point, next: Point, radius: number) {
  const r = Math.min(radius, distance(corner, prev) / 2, distance(corner, next) / 2);
  return {
    start: pullBack(corner, prev, r),
    end: pullBack(corner, next, r),
  };
}

export type PathSegment =
  | { type: "move"; to: Point }
  | { type: "line"; to: Point }
  | { type: "quad"; control: Point; to: Point }
  | { type: "close" };

/** The torso+arms outline as an ordered, medium-agnostic path: hip → waist
 *  (bulged) → rounded shoulder tip → neck peak → rounded shoulder tip →
 *  waist (bulged) → hip → close. Every segment only ever advances toward
 *  the next vertex — nothing folds back over ground already covered — so a
 *  single fill of this path paints flat, uniform coverage with no seam. */
export function personTorsoPath(geo: PersonGeometry): PathSegment[] {
  const t = geo.torso;
  const midYLeft = (t.hipL.y + t.waistL.y) / 2;
  const midYRight = (t.hipR.y + t.waistR.y) / 2;
  const leftRound = roundCorner(t.waistL, t.shoulderTipL, t.peak, t.cornerR);
  const rightRound = roundCorner(t.peak, t.shoulderTipR, t.waistR, t.cornerR);

  return [
    { type: "move", to: t.hipL },
    { type: "quad", control: { x: t.waistL.x - t.sideBulge, y: midYLeft }, to: t.waistL },
    { type: "line", to: leftRound.start },
    { type: "quad", control: t.shoulderTipL, to: leftRound.end },
    { type: "line", to: t.peak },
    { type: "line", to: rightRound.start },
    { type: "quad", control: t.shoulderTipR, to: rightRound.end },
    { type: "line", to: t.waistR },
    { type: "quad", control: { x: t.waistR.x + t.sideBulge, y: midYRight }, to: t.hipR },
    { type: "close" },
  ];
}

/** One tapered leg strip (hip-outer → hip-inner → ankle-inner →
 *  ankle-outer → close) as the same medium-agnostic path shape. */
export function personLegPath(leg: PersonLegGeometry): PathSegment[] {
  return [
    { type: "move", to: leg.hipOuter },
    { type: "line", to: leg.hipInner },
    { type: "line", to: leg.ankleInner },
    { type: "line", to: leg.ankleOuter },
    { type: "close" },
  ];
}

/** Tight bounding boxes for the whole figure, the head, and the torso —
 *  derived straight from the resolved geometry so a caller placing
 *  annotation boxes never has to hand-duplicate the figure's own
 *  measurements (and risk them drifting apart). */
export function personBoundingBoxes(
  geo: PersonGeometry,
  margin: number
): { person: Box; head: Box; torso: Box } {
  const head: Box = {
    x: geo.head.cx - geo.head.r - margin,
    y: geo.head.cy - geo.head.r - margin,
    w: (geo.head.r + margin) * 2,
    h: (geo.head.r + margin) * 2,
  };

  const torso: Box = {
    x: geo.torso.shoulderTipL.x - margin,
    y: geo.torso.peak.y - margin,
    w: geo.torso.shoulderTipR.x - geo.torso.shoulderTipL.x + margin * 2,
    h: geo.torso.waistL.y - geo.torso.peak.y + margin * 2,
  };

  const figureLeft = Math.min(geo.torso.hipL.x, geo.torso.shoulderTipL.x);
  const figureRight = Math.max(geo.torso.hipR.x, geo.torso.shoulderTipR.x);
  const figureTop = geo.head.cy - geo.head.r;
  const figureBottom = Math.max(
    geo.legLeft.ankleInner.y,
    geo.legLeft.ankleOuter.y,
    geo.legRight.ankleInner.y,
    geo.legRight.ankleOuter.y
  );
  const person: Box = {
    x: figureLeft - margin,
    y: figureTop - margin,
    w: figureRight - figureLeft + margin * 2,
    h: figureBottom - figureTop + margin * 2,
  };

  return { person, head, torso };
}
