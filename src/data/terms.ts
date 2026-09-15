export interface TermEntry {
  title: string;
  meta: string;
}

export const terms = {
  "computer-vision": {
    title: "Semi-Supervised PPE Detection",
    meta: "YOLOv9 · mAP@50 0.614 on the public training log",
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
    meta: "2025 · Research · manuscript available",
  },
} as const satisfies Record<string, TermEntry>;

export type TermId = keyof typeof terms;
