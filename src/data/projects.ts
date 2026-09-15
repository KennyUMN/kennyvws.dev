export type ProjectCategory = "Computer Vision" | "LLM / Agents" | "ML Systems";

export const categories: ProjectCategory[] = [
  "Computer Vision",
  "LLM / Agents",
  "ML Systems",
];

export interface Project {
  title: string;
  blurb: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  year: string;
  status: string;
  featured?: boolean;
  /** Omitted when the work has no public repo — the row then renders without a GitHub link. */
  github?: string;
  paper?: string;
  /** Numbers copied from the project's own public artifacts. Never invented —
   *  if there is no verifiable source, the field stays absent. */
  metrics?: { label: string; value: string }[];
  /** Which artifact the metrics came from. Two public artifacts report
   *  different runs, so the page has to say which one it is quoting. */
  metricsSource?: string;
}

export const projects: Project[] = [
  {
    title: "Semi-Supervised PPE Detection",
    blurb: "YOLOv9 + pseudo-labeling for construction-site safety gear.",
    description:
      "Detects hardhats, vests, and missing PPE on construction sites. Uses a semi-supervised pseudo-labeling loop to cut manual annotation, with a confidence-thresholded teacher-student setup. The training log and the manuscript are both public.",
    category: "Computer Vision",
    tags: ["YOLOv9", "PyTorch", "Semi-Supervised", "OpenCV"],
    year: "2025",
    status: "Research · manuscript available",
    featured: true,
    github: "https://github.com/KennyUMN/ppe-compliance-ssl-yolov9",
    paper: "https://drive.google.com/file/d/1GjKGlQ2XhC3NixaNyOZycBKS09GeofFR/view",
    // Read from results/training-results.csv (epoch 50) in the public repo.
    // The manuscript reports a different run on a 60% labeled split
    // (mAP@50 0.8368); these are the 20%-labeled repo numbers. Verify before editing.
    metrics: [
      { label: "mAP@50", value: "0.614" },
      { label: "Precision", value: "0.704" },
      { label: "Recall", value: "0.573" },
      { label: "mAP@50-95", value: "0.409" },
    ],
    metricsSource: "20% labeled split · repo training log, epoch 50",
  },
  {
    title: "Bandar Tracker",
    blurb: "Smart-money flow tracker for the Indonesia Stock Exchange.",
    description:
      "Parses KSEI ownership data and broker summaries to surface accumulation and distribution by large players (bandarmologi). FastAPI + async SQLAlchemy backend, single-file charting frontend on Lightweight Charts.",
    category: "ML Systems",
    tags: ["FastAPI", "Async SQLAlchemy", "Pandas", "Data Pipeline"],
    year: "2025",
    status: "Active",
    featured: true,
    // Repo is private (BACKUP-BANDAR-TRACKER) — no public link to give.
  },
  {
    title: "RAG Evaluation Harness",
    blurb: "Measure retrieval quality before trusting a RAG answer.",
    description:
      "A reproducible harness that scores retrieval-augmented pipelines with RAGAS, runs against local models through Ollama, and tracks faithfulness and context-recall across config changes so regressions are caught early.",
    category: "LLM / Agents",
    tags: ["LlamaIndex", "RAGAS", "Ollama", "Evaluation"],
    year: "2025",
    status: "Active",
    // No public repo yet.
  },
  {
    title: "Tiny Transformer From Scratch",
    blurb: "A 12M-param decoder-only transformer, no framework magic.",
    description:
      "A small decoder-only transformer trained on Indonesian Wikipedia. Built to actually understand the internals: tokenizer training, mixed precision, KV cache, and a minimal inference server.",
    category: "ML Systems",
    tags: ["PyTorch", "Transformers", "Tokenizers"],
    year: "2024",
    status: "Complete",
    // No public repo yet.
  },
  {
    title: "Document Q&A Agent",
    blurb: "Ask questions across a folder of PDFs, get cited answers.",
    description:
      "A local-first retrieval agent over personal documents. Chunking and hybrid search with citations back to the source page, so answers are checkable instead of vibes.",
    category: "LLM / Agents",
    tags: ["LangChain", "FastAPI", "Hugging Face", "RAG"],
    year: "2025",
    status: "Active",
    github: "https://github.com/KennyUMN/finrag-id",
  },
];
