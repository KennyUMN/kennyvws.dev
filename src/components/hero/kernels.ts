// Convolutions over a single-channel raster (the headline's glyph alpha, 0 to 255), row-major W x H.

export type KernelId = "sobel" | "laplacian" | "gaussian" | "mask";

export interface Kernel {
  id: KernelId;
  /** Button label in the switcher. */
  label: string;
  /** Badge inside the lens. */
  chip: string;
  /** Completes "Your browser just ran ... over this headline". */
  phrase: string;
  /** What the lens readout measures. */
  unit: string;
}

export const KERNELS: readonly Kernel[] = [
  { id: "sobel", label: "Sobel", chip: "Sobel 3×3", phrase: "a 3×3 Sobel edge filter", unit: "% edge px" },
  { id: "laplacian", label: "Laplacian", chip: "Laplacian 3×3", phrase: "a 3×3 Laplacian filter", unit: "% edge px" },
  { id: "gaussian", label: "Gaussian", chip: "Gaussian blur", phrase: "a Gaussian blur", unit: "% ink" },
  { id: "mask", label: "Edge mask", chip: "Edge mask", phrase: "a 3×3 Sobel filter and a threshold", unit: "% edge px" },
];

export const kernelById = (id: KernelId): Kernel => KERNELS.find((k) => k.id === id) ?? KERNELS[0];

/** Sobel gradient magnitude sqrt(Gx^2 + Gy^2) over columns [c0, c1); the one-pixel border stays 0. */
export function sobelMagnitude(A: Uint8Array, W: number, H: number, M: Uint16Array, c0 = 1, c1 = W - 1) {
  c0 = Math.max(1, c0);
  c1 = Math.min(W - 1, c1);
  for (let y = 1; y < H - 1; y++) {
    let i = y * W + c0;
    for (let x = c0; x < c1; x++, i++) {
      const a = A[i - W - 1], b = A[i - W], c = A[i - W + 1];
      const d = A[i - 1], f = A[i + 1];
      const g = A[i + W - 1], h = A[i + W], k = A[i + W + 1];
      const gx = c + 2 * f + k - a - 2 * d - g;
      const gy = g + 2 * h + k - a - 2 * b - c;
      M[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }
}

/** |Laplacian| with the 8-neighbour kernel [1 1 1; 1 -8 1; 1 1 1]. */
export function laplacianMagnitude(A: Uint8Array, W: number, H: number, L: Uint16Array) {
  for (let y = 1; y < H - 1; y++) {
    let i = y * W + 1;
    for (let x = 1; x < W - 1; x++, i++) {
      const s =
        A[i - W - 1] + A[i - W] + A[i - W + 1] + A[i - 1] + A[i + 1] + A[i + W - 1] + A[i + W] + A[i + W + 1];
      L[i] = Math.abs(s - 8 * A[i]);
    }
  }
}

// One running-sum box pass of radius r along rows (step 1) or columns (step W), zero outside the image.
function boxPass(src: Uint8Array, dst: Uint8Array, W: number, H: number, r: number, horizontal: boolean) {
  const lines = horizontal ? H : W;
  const len = horizontal ? W : H;
  const step = horizontal ? 1 : W;
  const span = 2 * r + 1;
  for (let l = 0; l < lines; l++) {
    const base = horizontal ? l * W : l;
    let sum = 0;
    for (let k = 0; k < Math.min(r, len); k++) sum += src[base + k * step];
    for (let k = 0; k < len; k++) {
      if (k + r < len) sum += src[base + (k + r) * step];
      if (k - r - 1 >= 0) sum -= src[base + (k - r - 1) * step];
      dst[base + k * step] = Math.round(sum / span);
    }
  }
}

/**
 * Gaussian blur approximated by three box passes per axis (the central limit theorem at work):
 * sigma = sqrt(((2r + 1)^2 - 1) / 4). Writes into `out`; `tmp` is scratch of the same size.
 */
export function gaussianBlur(A: Uint8Array, W: number, H: number, r: number, out: Uint8Array, tmp: Uint8Array) {
  out.set(A);
  for (let pass = 0; pass < 3; pass++) {
    boxPass(out, tmp, W, H, r, true);
    boxPass(tmp, out, W, H, r, false);
  }
}

/** Summed-area table of `w`, so any window's total is four lookups. Size (W + 1) x (H + 1). */
export function summedArea(w: Uint8Array, W: number, H: number): Uint32Array {
  const W1 = W + 1;
  const S = new Uint32Array(W1 * (H + 1));
  for (let y = 0; y < H; y++) {
    let row = 0;
    for (let x = 0; x < W; x++) {
      row += w[y * W + x];
      S[(y + 1) * W1 + x + 1] = S[y * W1 + x + 1] + row;
    }
  }
  return S;
}

/** Total of `w` over [x0, x1) x [y0, y1), read from its summed-area table. */
export function windowSum(S: Uint32Array, W: number, x0: number, y0: number, x1: number, y1: number): number {
  const W1 = W + 1;
  return S[y1 * W1 + x1] - S[y0 * W1 + x1] - S[y1 * W1 + x0] + S[y0 * W1 + x0];
}
