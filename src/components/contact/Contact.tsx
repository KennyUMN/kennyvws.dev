"use client";

import { useRef } from "react";
import { contact, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { EASE_OUT, SETTLE } from "@/lib/motion";

const links = [
  { label: "GitHub", href: site.socials.github },
  { label: "LinkedIn", href: site.socials.linkedin },
  { label: "X", href: site.socials.x },
];

export function Contact() {
  const lines = contact.closing.split(/(?<=\.)\s+/);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Each imperative lands as its own beat: its words rise out of their masks and settle from a
  // slight tilt, one line after another as the statement scrolls in.
  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        for (const line of gsap.utils.toArray<HTMLElement>("[data-line]", headingRef.current)) {
          gsap.from(line.querySelectorAll("[data-word]"), {
            yPercent: 115,
            rotate: 7,
            transformOrigin: "0% 100%",
            duration: 1.1,
            stagger: 0.07,
            ease: EASE_OUT,
            ...SETTLE,
            scrollTrigger: { trigger: line, start: "top 90%", once: true },
          });
        }
      });
    },
    { scope: headingRef },
  );

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-16 pb-[clamp(4rem,2rem+5vw,8rem)] pt-[clamp(3rem,2rem+3vw,6rem)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div aria-hidden className="mb-[clamp(3rem,2rem+4vw,7rem)] border-t border-rule" />
        <h2
          ref={headingRef}
          id="contact-heading"
          className="font-wide text-[clamp(2.4rem,0.9rem+5.4vw,7.25rem)] font-extrabold leading-[0.95] tracking-[-0.035em]"
        >
          {lines.map((line, i) => (
            <span key={line} data-line className="block">
              {i > 0 && " "}
              {line.split(" ").map((word, j) => (
                <span key={j}>
                  {j > 0 && " "}
                  {/* The mask is padded so descenders survive the 0.95 line height. */}
                  <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                    <span data-word data-reveal className="inline-block">
                      {word}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h2>

        <Reveal delay={0.3} className="mt-14 grid gap-y-8 sm:mt-20 lg:grid-cols-12 lg:gap-x-12">
          <p className="max-w-[34ch] text-xl leading-snug text-ink-2 sm:text-2xl lg:col-span-5">{contact.invite}</p>
          <div className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7 lg:items-end">
            <Magnetic strength={0.22} className="self-start lg:self-end">
              <ButtonLink href={`mailto:${site.email}`} className="min-h-14 px-6 text-lg">
                {site.email}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </ButtonLink>
            </Magnetic>
            <ul className="flex flex-wrap gap-x-7 text-[15px] font-medium">
              {links.map((link) => (
                <li key={link.label}>
                  <Magnetic strength={0.35}>
                    <TextLink href={link.href} external>
                      {link.label}
                    </TextLink>
                  </Magnetic>
                </li>
              ))}
              <li>
                <Magnetic strength={0.35}>
                  <TextLink href={site.resume}>Résumé</TextLink>
                </Magnetic>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
