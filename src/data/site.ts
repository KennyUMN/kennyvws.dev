export const site = {
  name: "Kenny",
  role: "AI Engineer · Computer Vision & LLM Systems",
  pitch:
    "I build computer vision and LLM systems, from the training loop to the server that keeps it running.",
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
    "I'm Kenny, a computer science student at Universitas Multimedia Nusantara working toward AI engineering. My current research teaches YOLOv9 to spot missing safety gear on construction sites with only a fifth of the images labeled by hand. The manuscript and every epoch of the training log are public.",
    "I like the unglamorous parts: cleaning the data, fighting the training run, getting a model to behave on a real server instead of a demo notebook. I build on a Mac and ship to a Linux homeserver with Docker, so everything has to work on both.",
    "If a tool is interesting and I can host it myself, I will.",
  ],
} as const;

export const contact = {
  framing:
    "Open to AI Engineer roles, internships, and research collaborations.",
  closing: "Clean the data. Fight the training run. Ship the server.",
} as const;
