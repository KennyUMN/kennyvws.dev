export type SkillCategory =
  | "Languages"
  | "ML / Deep Learning"
  | "LLM / Applied AI"
  | "Infra / MLOps";

export interface SkillGroup {
  category: SkillCategory;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: "Languages",
    items: ["Python", "TypeScript", "C++", "SQL", "Bash"],
  },
  {
    category: "ML / Deep Learning",
    items: ["PyTorch", "YOLOv9", "scikit-learn", "OpenCV", "Pandas", "NumPy"],
  },
  {
    category: "LLM / Applied AI",
    items: ["Hugging Face", "LangChain", "LlamaIndex", "Ollama", "FastAPI", "RAGAS"],
  },
  {
    category: "Infra / MLOps",
    items: ["Docker", "Linux", "GitHub Actions", "Weights & Biases", "PostgreSQL", "Ubuntu"],
  },
];
