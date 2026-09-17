"use client";

import { motion } from "motion/react";
import { DUR_BASE, DUR_FAST, EASE_OUT, staggerParent } from "@/lib/motion";
import { contact, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const socialLinks = [
  { label: "GitHub", href: site.socials.github },
  { label: "LinkedIn", href: site.socials.linkedin },
  { label: "X", href: site.socials.x },
];

export function Contact() {
  return (
    <>
      <Section id="contact" title="Let's talk." index={4}>
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed text-ink-muted">
              {contact.framing}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <ButtonLink href={`mailto:${site.email}`}>{site.email}</ButtonLink>
              <ul className="flex items-center gap-x-6">
                {socialLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center text-[15px] font-medium text-ink-muted transition-colors hover:text-ink"
                    >
                      <span className="link-draw">{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* The close is the page's one engineered moment: full-bleed, inverted
          ground, large centered type. Inverting with the existing ink/surface
          tokens flips correctly in both themes — no new colour, no scrim, and
          the last thing on screen is a change of state instead of another
          paragraph. */}
      <section
        aria-label="Closing statement"
        className="border-y border-edge bg-ink px-6 py-[clamp(4rem,2.5rem+6vw,9rem)]"
      >
        <motion.div
          className="mx-auto max-w-5xl text-center"
          variants={staggerParent(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-64px 0px" }}
        >
          <motion.p
            className="text-balance text-2xl font-medium leading-[1.15] tracking-[-0.015em] text-surface sm:text-4xl"
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: DUR_BASE, ease: EASE_OUT } },
            }}
          >
            {contact.closing}
          </motion.p>
          <motion.p
            className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-surface/60"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: DUR_FAST, ease: EASE_OUT, delay: 0.12 } },
            }}
          >
            {contact.framing}
          </motion.p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <ButtonLink href={`mailto:${site.email}`}>{site.email}</ButtonLink>
            <ul className="flex items-center gap-x-6">
              {socialLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-surface/70 transition-colors hover:text-surface"
                  >
                    <span className="link-draw">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>
    </>
  );
}
