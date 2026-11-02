import { describe, expect, test } from "vitest";
import {
  gaussianBlur,
  KERNELS,
  laplacianMagnitude,
  sobelMagnitude,
  summedArea,
  windowSum,
} from "@/components/hero/kernels";

const W = 8;
const H = 6;

// Left half empty, right half full ink: one vertical step edge between x = 3 and x = 4.
function stepImage() {
  const A = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 4; x < W; x++) A[y * W + x] = 255;
  return A;
}

describe("sobelMagnitude", () => {
  test("a full 0-to-255 step reads 4 x 255 on both sides of the edge and 0 on flat ink", () => {
    const M = new Uint16Array(W * H);
    sobelMagnitude(stepImage(), W, H, M);
    const row = 2 * W;
    expect(M[row + 3]).toBe(1020);
    expect(M[row + 4]).toBe(1020);
    expect(M[row + 1]).toBe(0);
    expect(M[row + 6]).toBe(0);
  });

  test("a column range leaves other columns untouched", () => {
    const M = new Uint16Array(W * H);
    sobelMagnitude(stepImage(), W, H, M, 1, 4);
    expect(M[2 * W + 3]).toBe(1020);
    expect(M[2 * W + 4]).toBe(0);
  });
});

describe("laplacianMagnitude", () => {
  test("flat regions read 0 and the step reads three neighbours of difference", () => {
    const L = new Uint16Array(W * H);
    laplacianMagnitude(stepImage(), W, H, L);
    const row = 2 * W;
    expect(L[row + 1]).toBe(0);
    expect(L[row + 6]).toBe(0);
    expect(L[row + 3]).toBe(3 * 255);
    expect(L[row + 4]).toBe(3 * 255);
  });
});

describe("gaussianBlur", () => {
  test("keeps flat ink flat and softens the step monotonically", () => {
    const A = new Uint8Array(32 * 4);
    for (let y = 0; y < 4; y++) for (let x = 16; x < 32; x++) A[y * 32 + x] = 255;
    const out = new Uint8Array(A.length);
    gaussianBlur(A, 32, 4, 1, out, new Uint8Array(A.length));
    const row = 32 * 2;
    expect(out[row + 0]).toBe(0);
    expect(out[row + 15]).toBeGreaterThan(0);
    expect(out[row + 16]).toBeLessThan(255);
    // Zero padding darkens the last few columns, so check the ramp away from the image border.
    for (let x = 1; x < 26; x++) expect(out[row + x]).toBeGreaterThanOrEqual(out[row + x - 1]);
  });

  test("does not change the input", () => {
    const A = stepImage();
    const copy = A.slice();
    gaussianBlur(A, W, H, 1, new Uint8Array(A.length), new Uint8Array(A.length));
    expect(A).toEqual(copy);
  });
});

describe("summedArea", () => {
  test("any window's total matches a direct count", () => {
    const w = new Uint8Array(W * H).map((_, i) => (i * 7) % 3);
    const S = summedArea(w, W, H);
    let direct = 0;
    for (let y = 1; y < 5; y++) for (let x = 2; x < 7; x++) direct += w[y * W + x];
    expect(windowSum(S, W, 2, 1, 7, 5)).toBe(direct);
  });
});

test("every kernel names what its readout measures", () => {
  expect(new Set(KERNELS.map((k) => k.id)).size).toBe(KERNELS.length);
  for (const k of KERNELS) {
    expect(k.unit).toMatch(/^% /);
    expect(`${k.label}${k.chip}${k.phrase}`).not.toMatch(/[–—]/);
  }
  // A blur has no edges to count.
  expect(KERNELS.find((k) => k.id === "gaussian")!.unit).not.toContain("edge");
});
