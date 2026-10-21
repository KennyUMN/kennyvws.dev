import type { Project } from "@/data/projects";

export function ProjectMeta({ project }: { project: Project }) {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-2">
      <span>{project.category}</span>
      <span>{project.year}</span>
      <span className="text-ink">{project.status}</span>
    </p>
  );
}
