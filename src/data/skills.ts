import type { IconType } from "react-icons";
import {
  SiCplusplus,
  SiDocker,
  SiFastapi,
  SiGithubactions,
  SiGnubash,
  SiHuggingface,
  SiLangchain,
  SiLinux,
  SiNumpy,
  SiOllama,
  SiOpencv,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiScikitlearn,
  SiTypescript,
  SiUbuntu,
  SiWeightsandbiases,
} from "react-icons/si";

export type SkillCategory =
  | "Languages"
  | "ML / Deep Learning"
  | "LLM / Applied AI"
  | "Infra / MLOps";

export interface Skill {
  name: string;
  icon?: IconType;
}

export interface SkillGroup {
  category: SkillCategory;
  items: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: "Languages",
    items: [
      { name: "Python", icon: SiPython },
      { name: "TypeScript", icon: SiTypescript },
      { name: "C++", icon: SiCplusplus },
      { name: "SQL" },
      { name: "Bash", icon: SiGnubash },
    ],
  },
  {
    category: "ML / Deep Learning",
    items: [
      { name: "PyTorch", icon: SiPytorch },
      { name: "YOLOv9" },
      { name: "scikit-learn", icon: SiScikitlearn },
      { name: "OpenCV", icon: SiOpencv },
      { name: "Pandas", icon: SiPandas },
      { name: "NumPy", icon: SiNumpy },
    ],
  },
  {
    category: "LLM / Applied AI",
    items: [
      { name: "Hugging Face", icon: SiHuggingface },
      { name: "LangChain", icon: SiLangchain },
      { name: "LlamaIndex" },
      { name: "Ollama", icon: SiOllama },
      { name: "FastAPI", icon: SiFastapi },
      { name: "RAGAS" },
    ],
  },
  {
    category: "Infra / MLOps",
    items: [
      { name: "Docker", icon: SiDocker },
      { name: "Linux", icon: SiLinux },
      { name: "GitHub Actions", icon: SiGithubactions },
      { name: "Weights & Biases", icon: SiWeightsandbiases },
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "Ubuntu", icon: SiUbuntu },
    ],
  },
];
