"use client";

import { useSyncExternalStore } from "react";
import { MOTION_REDUCE } from "@/lib/gsap";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOTION_REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True when the visitor asks for reduced motion. The server render assumes motion is allowed. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOTION_REDUCE).matches,
    () => false,
  );
}
