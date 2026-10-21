"use client";

import { m } from "motion/react";
import { contact, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { EASE_OUT } from "@/lib/motion";

const links = [
  { label: "GitHub", href: site.socials.github },
  { label: "LinkedIn", href: site.socials.linkedin },
  { label: "X", href: site.socials.x },
];

export function Contact() {
  const lines = contact.closing.split(/(?<=\.)\s+/);

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-16 pb-[clamp(4rem,2rem+5vw,8rem)] pt-[clamp(3rem,2rem+3vw,6rem)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div aria-hidden className="mb-[clamp(3rem,2rem+4vw,7rem)] border-t border-rule" />
        <h2
          id="contact-heading"
          className="font-wide text-[clamp(2.4rem,0.9rem+5.4vw,7.25rem)] font-extrabold leading-[0.95] tracking-[-0.045em]"
        >
          {lines.map((line, i) => (
            <m.span
              key={line}
              className="block overflow-hidden pb-[0.06em]"
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, margin: "-60px 0px" }}
            >
              {i > 0 && " "}
              <m.span
                data-reveal
                className="block"
                variants={{ hidden: { y: "105%" }, shown: { y: 0 } }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: EASE_OUT }}
              >
                {line}
              </m.span>
            </m.span>
          ))}
        </h2>

        <Reveal delay={0.3} className="mt-14 grid gap-y-8 sm:mt-20 lg:grid-cols-12 lg:gap-x-12">
          <p className="max-w-[34ch] text-xl leading-snug text-ink-2 sm:text-2xl lg:col-span-5">{contact.framing}</p>
          <div className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7 lg:items-end">
            <ButtonLink href={`mailto:${site.email}`} className="min-h-14 px-6 text-lg">
              {site.email}
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </ButtonLink>
            <ul className="flex flex-wrap gap-x-7 text-[15px] font-medium">
              {links.map((link) => (
                <li key={link.label}>
                  <TextLink href={link.href} external>
                    {link.label}
                  </TextLink>
                </li>
              ))}
              <li>
                <TextLink href={site.resume}>Résumé</TextLink>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
