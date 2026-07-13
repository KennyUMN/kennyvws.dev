export interface Post {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
  href: string;
}

// Placeholder drafts — swap href to real post URLs when published.
export const posts: Post[] = [
  {
    title: "Pseudo-Labeling Made My PPE Detector Better, Then Worse",
    excerpt:
      "What confidence thresholds actually do to a YOLOv9 teacher-student loop, and how a bad threshold quietly poisons the next training round.",
    date: "2026-03-12",
    readTime: "8 min",
    tag: "Computer Vision",
    href: "#",
  },
  {
    title: "You Cannot Trust a RAG System You Have Not Measured",
    excerpt:
      "Setting up faithfulness and context-recall scoring with RAGAS so retrieval regressions show up as numbers, not user complaints.",
    date: "2026-01-28",
    readTime: "9 min",
    tag: "LLM / Applied AI",
    href: "#",
  },
  {
    title: "Reading Smart Money on the IDX",
    excerpt:
      "Turning KSEI ownership data into an accumulation signal, and why the cleaning step is most of the work in any real data project.",
    date: "2025-11-09",
    readTime: "7 min",
    tag: "ML Systems",
    href: "#",
  },
  {
    title: "Training a Tiny Transformer on One Consumer GPU",
    excerpt:
      "Notes on mixed precision, gradient checkpointing, and the small decisions that decide whether 12M parameters fit on a single card.",
    date: "2025-09-02",
    readTime: "6 min",
    tag: "ML Systems",
    href: "#",
  },
];
