export const site = {
  name: "Kenny",
  role: "AI Engineer · Computer Vision & LLM Systems",
  pitch:
    "I build machine learning systems end to end: computer vision and LLM tooling, from the training loop to the server that keeps it running.",
  url: "https://kennyvws-dev.vercel.app",
  email: "kennyvws1@gmail.com",
  resume: "/resume.pdf",
  socials: {
    github: "https://github.com/KennyUMN",
    linkedin: "https://www.linkedin.com/in/kenny-sembiring-5a5623309/",
    x: "https://x.com/kenny_sembiring",
  },
} as const;

export const about = {
  paragraphs: [
    "I'm Kenny, a Computer Science student at Universitas Multimedia Nusantara heading toward AI engineering. My current research is a semi-supervised YOLOv9 pipeline for detecting personal protective equipment on construction sites, with the manuscript and full training log public on GitHub.",
    "I like the unglamorous parts: cleaning the data, fighting the training run, and getting a model to behave on a real server instead of a demo notebook. I build on a Mac and ship to a Linux homeserver with Docker, so things have to work on both.",
    "If a tool is interesting and I can self-host it, I will.",
  ],
  facts: [
    {
      title: "Training",
      body: "I train and debug models myself, not just call an API. Vision, tabular, and small transformers.",
    },
    {
      title: "Shipping",
      body: "Models that stay on a laptop don't count. I package, serve, and monitor what I build.",
    },
    {
      title: "Writing",
      body: "I document what I learn. If a paper is interesting and the code is messy, I port it and write it up.",
    },
  ],
} as const;

export const contact = {
  framing:
    "Open to AI Engineer roles, internships, and research collaborations.",
  closing: "Clean the data. Fight the training run. Ship the server.",
} as const;
