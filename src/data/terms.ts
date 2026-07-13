export interface TermEntry {
  title: string;
  meta: string;
}

export const terms = {
  "computer-vision": {
    title: "Semi-Supervised PPE Detection",
    meta: "YOLOv9 · research, in submission to Automation in Construction",
  },
  "llm-tooling": {
    title: "RAG eval harness · doc Q&A agent",
    meta: "Local-first, measured before trusted",
  },
  "the-server": {
    title: "Linux homeserver",
    meta: "Docker · self-hosted, monitored",
  },
  "yolo-pipeline": {
    title: "Semi-Supervised PPE Detection",
    meta: "2025 · Research, in submission",
  },
} as const satisfies Record<string, TermEntry>;

export type TermId = keyof typeof terms;
