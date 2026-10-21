"use client";

import { m } from "motion/react";
import type { Project } from "@/data/projects";
import { EASE_OUT } from "@/lib/motion";

const SCALE_MAX = 0.7;

export function AblationBars({ ablation }: { ablation: NonNullable<Project["ablation"]> }) {
  return (
    <figure className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4">
        {ablation.rows.map((row, i) => (
          <li key={`${row.label}-${row.labeledShare}`} className="grid items-center gap-x-4 gap-y-1.5 sm:grid-cols-[minmax(0,9.5rem)_1fr]">
            <span className="text-sm leading-tight text-ink-2">
              <span className={row.semiSupervised ? "font-semibold text-ink" : undefined}>{row.label}</span>
              <span className="block font-mono text-[11px] text-ink-3">{row.labeledShare} labels</span>
            </span>
            <span className="flex items-center gap-3">
              <m.span
                data-reveal
                className={`block h-5 origin-left ${row.semiSupervised ? "bg-accent" : "bg-ink-3/45"}`}
                style={{ width: `${(row.value / SCALE_MAX) * 100}%` }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: EASE_OUT }}
              />
              <span className={`font-mono text-sm tabular-nums ${row.semiSupervised ? "font-semibold text-ink" : "text-ink-2"}`}>
                {row.value.toFixed(3)}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <figcaption className="text-sm leading-relaxed text-ink-2">
        {ablation.checkpoint}
        <span className="mt-1 block font-mono text-[11px] text-ink-3">{ablation.source}</span>
      </figcaption>
    </figure>
  );
}
