export type ProjectCategory = "Computer Vision" | "LLM / Agents" | "ML Systems" | "Data Systems";

export const categories: ProjectCategory[] = [
  "Computer Vision",
  "LLM / Agents",
  "ML Systems",
  "Data Systems",
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
  /** The code exists but the repo is private, so there is nothing to link. */
  privateRepo?: boolean;
  paper?: string;
  /** Numbers copied from the project's own public artifacts. Never invented —
   *  if there is no verifiable source, the field stays absent. */
  metrics?: { label: string; value: string }[];
  /** Which artifact the metrics came from. Two public artifacts report
   *  different runs, so the page has to say which one it is quoting. */
  metricsSource?: string;
  /** How it works, in order. Each step restates the project's own README or description. */
  approach?: { title: string; body: string }[];
  /** A controlled comparison read from the project's own published chart. */
  ablation?: {
    metric: string;
    source: string;
    /** Which checkpoint the reported numbers are, so a reader sees the selection rule. */
    checkpoint: string;
    /** One-sentence result for the hero strip. Its numbers are tested against `rows`. */
    claim: string;
    /** Caption under the gain figure. */
    gainCaption: string;
    rows: { label: string; labeledShare: string; value: number; semiSupervised: boolean }[];
  };
}

export const projects: Project[] = [
  {
    title: "Semi-Supervised PPE Detection",
    blurb: "Finds missing safety gear on construction sites, trained with hand labels on only 20% of the images.",
    description:
      "Detects helmets and safety vests in construction-site footage, then marks each worker compliant or in violation. Trained on the public SH17 dataset. The 50-epoch training log and the manuscript are public.",
    category: "Computer Vision",
    tags: ["YOLOv9", "PyTorch", "Semi-Supervised", "OpenCV"],
    year: "2025",
    status: "Team course project · manuscript public",
    featured: true,
    github: "https://github.com/KennyUMN/ppe-compliance-ssl-yolov9",
    paper: "https://drive.google.com/file/d/1GjKGlQ2XhC3NixaNyOZycBKS09GeofFR/view",
    // The repo README opens with "Course project (Machine Learning final project, Kelompok 4)".
    // Read from results/training-results.csv (epoch 50) in the public repo.
    // The manuscript reports a different run on a 60% labeled split
    // (mAP@50 0.8368); these are the 20%-labeled repo numbers. Verify before editing.
    metrics: [
      { label: "mAP@50", value: "0.614" },
      { label: "Precision", value: "0.704" },
      { label: "Recall", value: "0.573" },
      { label: "mAP@50-95", value: "0.409" },
    ],
    metricsSource: "Repo training log, 20% labeled split",
    // Restated from the repo README's Approach section.
    approach: [
      { title: "Baseline", body: "Train YOLOv9-c on the 20% labeled split." },
      { title: "Pseudo-label", body: "Run the baseline over the other 80% and keep detections above a confidence threshold." },
      { title: "Retrain", body: "Train again on labeled and pseudo-labeled data together." },
      { title: "Comply", body: "Match each PPE box to a person by IoU, then mark that worker compliant or in violation." },
    ],
    // Values printed on results/grafik_ablation_study.png in the public repo.
    // 0.621 is the peak epoch of the same log (epoch 40), not the final epoch.
    ablation: {
      metric: "mAP@50",
      source: "Ablation study · results/grafik_ablation_study.png",
      checkpoint: "0.621 is epoch 40, the best epoch of the log above. The run ends at 0.614 on epoch 50.",
      claim: "Pseudo-labeling lifts YOLOv9 from 0.493 to 0.621 mAP@50 on the same 20% of labels.",
      gainCaption: "mAP@50 gained by pseudo-labeling at the best epoch, with the same hand labels.",
      rows: [
        { label: "Supervised", labeledShare: "10%", value: 0.371, semiSupervised: false },
        { label: "Supervised", labeledShare: "20%", value: 0.493, semiSupervised: false },
        { label: "Semi-supervised", labeledShare: "20%", value: 0.621, semiSupervised: true },
      ],
    },
  },
  {
    title: "FinRAG-ID",
    blurb: "Cited answers from Indonesian financial reports.",
    description:
      "Ask an Indonesian annual report, prospectus or financial statement a question and get an answer that cites its pages. It runs local-first, and one Docker Compose command brings up Qdrant, Ollama, the API and the UI.",
    category: "LLM / Agents",
    tags: ["LlamaIndex", "Qdrant", "BGE-M3", "Ollama", "RAGAS", "Docker Compose"],
    year: "2025",
    status: "Active",
    featured: true,
    github: "https://github.com/KennyUMN/finrag-id",
    // Restated from the repo README (architecture, design decisions, evaluation).
    approach: [
      { title: "Ingest", body: "pdfplumber pages with metadata, split into sentence chunks." },
      { title: "Retrieve", body: "Sastrawi BM25 and BGE-M3 dense search over Qdrant, fused by reciprocal rank fusion." },
      { title: "Answer", body: "Llama 3.1 8B on Ollama, OpenRouter when Ollama is down, sources tagged [S1] to [Sn]." },
      { title: "Evaluate", body: "RAGAS faithfulness, answer relevancy and context precision, plus latency p50 and p95." },
    ],
  },
  {
    title: "Bandar Tracker",
    blurb: "Smart-money flow tracker for the Indonesia Stock Exchange.",
    description:
      "Reads KSEI ownership data and broker summaries to show where large players are accumulating or distributing, the analysis IDX traders call bandarmologi. FastAPI with async SQLAlchemy behind a one-file Lightweight Charts front end.",
    category: "Data Systems",
    tags: ["FastAPI", "Async SQLAlchemy", "Pandas", "Data Pipeline"],
    year: "2025",
    status: "Active",
    privateRepo: true,
    // Restated from the description above; no step claims more than it says.
    approach: [
      { title: "Ingest", body: "KSEI ownership data and broker summaries." },
      { title: "Parse", body: "Parse and clean both sources with Pandas." },
      { title: "Signal", body: "Accumulation and distribution by large players." },
      { title: "Serve", body: "FastAPI with async SQLAlchemy, charted on Lightweight Charts." },
    ],
    // Repo is private (BACKUP-BANDAR-TRACKER) — no public link to give.
  },
  {
    title: "RAG Evaluation Harness",
    blurb: "Measure retrieval before trusting a RAG answer.",
    description:
      "A reproducible harness that scores RAG pipelines with RAGAS against local models on Ollama, and tracks faithfulness and context recall across config changes so regressions show up early.",
    category: "LLM / Agents",
    tags: ["LlamaIndex", "RAGAS", "Ollama", "Evaluation"],
    year: "2025",
    status: "Active",
    // No public repo yet.
  },
  {
    title: "Tiny Transformer From Scratch",
    blurb: "A 12M-parameter decoder-only model, built to learn the internals.",
    description:
      "Trained on Indonesian Wikipedia, with tokenizer training, mixed precision, a KV cache and a minimal inference server.",
    category: "ML Systems",
    tags: ["PyTorch", "Transformers", "Tokenizers"],
    year: "2024",
    status: "Complete",
    // No public repo yet.
  },
];
