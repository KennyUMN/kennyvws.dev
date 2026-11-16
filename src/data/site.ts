export const site = {
  name: "Kenny",
  role: "AI / ML Engineer · LLM Systems & Applied ML",
  title: "AI / ML engineer",
  location: "Tangerang, Indonesia",
  pitch:
    "I build machine learning and LLM systems, from the training loop to the server that keeps them running.",
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
    "I'm Kenny, a computer science student at Universitas Multimedia Nusantara in Tangerang, working toward AI engineering. I like the unglamorous parts of machine learning: cleaning the data, fighting the training run, getting a model to behave on a real server instead of a demo notebook.",
    "I build on a Mac and ship to a Linux homeserver with Docker, so everything has to work on both. If a tool is interesting and I can host it myself, I will.",
  ],
} as const;

export const contact = {
  framing:
    "Open to AI and ML engineer roles, internships, and research collaborations.",
  closing: "Clean the data. Fight the training run. Ship the server.",
  invite: "Hiring an AI or ML engineer or intern, or looking for a research collaborator? Write to me.",
} as const;
