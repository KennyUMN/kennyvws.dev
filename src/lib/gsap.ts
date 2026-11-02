"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

// The site's curves, shared with the CSS transitions in globals.css (cubic-bezier(0.16, 1, 0.3, 1)).
CustomEase.create("site-out", "0.16,1,0.3,1");
CustomEase.create("site-soft", "0.22,0.61,0.36,1");

/** Run motion only when the visitor has not asked for less of it. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCE = "(prefers-reduced-motion: reduce)";
/** Hover effects only where a hover exists. */
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
