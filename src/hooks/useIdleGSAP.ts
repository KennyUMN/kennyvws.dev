"use client";

import { useGSAP } from "@/lib/gsap";

// Build no later than this, even on a page that never goes idle.
const IDLE_TIMEOUT_MS = 1000;

/**
 * useGSAP for motion that starts below the fold. Each setup waits for an idle moment after
 * hydration, so building scroll triggers, hidden states and text splits lands as several short
 * tasks instead of one long one. Everything built is still reverted on unmount.
 */
export function useIdleGSAP(setup: () => void, scope?: React.RefObject<Element | null>) {
  useGSAP(
    (_, contextSafe) => {
      const run = contextSafe!(setup);
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
        return () => window.cancelIdleCallback(id);
      }
      const id = window.setTimeout(run, 1);
      return () => window.clearTimeout(id);
    },
    { scope },
  );
}
