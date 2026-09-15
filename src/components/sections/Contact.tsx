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
      <Section id="contact" title="Let's talk.">
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
          ground, large type. Inverting with the existing ink/surface tokens
          flips correctly in both themes — no new colour, no scrim, and the
          last thing on screen is a change of state instead of another
          paragraph. */}
      <section
        aria-label="Closing statement"
        className="border-y border-edge bg-ink px-6 py-[clamp(4rem,2.5rem+6vw,9rem)]"
      >
        <Reveal>
          <p className="mx-auto max-w-5xl text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.02em] text-surface sm:text-5xl">
            {contact.closing}
          </p>
        </Reveal>
      </section>
    </>
  );
}
