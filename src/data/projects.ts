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
  github: string;
  paper?: string;
}

export const projects: Project[] = [
  {
    title: "Semi-Supervised PPE Detection",
    blurb: "YOLOv9 + pseudo-labeling for construction-site safety gear.",
    description:
      "Detects hardhats, vests, and missing PPE on construction sites. Uses a semi-supervised pseudo-labeling loop to cut manual annotation, with a confidence-thresholded teacher-student setup. Written up for submission to Automation in Construction.",
    category: "Computer Vision",
    tags: ["YOLOv9", "PyTorch", "Semi-Supervised", "OpenCV"],
    year: "2025",
    status: "Research, in submission",
    featured: true,
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/ppe-detection",
    // TODO(Kenny): replace with the real paper link when available
    paper: "#",
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
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/bandar-tracker",
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
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/rag-eval-harness",
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
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/tiny-transformer",
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
    // TODO(Kenny): confirm exact repo name
    github: "https://github.com/KennyUMN/doc-qa-agent",
  },
];
