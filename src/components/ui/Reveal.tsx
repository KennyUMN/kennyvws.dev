"use client";

import { motion } from "motion/react";
import { reveal, type RevealRole } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  variant?: RevealRole;
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  variant = "body",
  className,
}: RevealProps) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={reveal(variant, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-64px 0px" }}
    >
      {children}
    </motion.div>
  );
}
