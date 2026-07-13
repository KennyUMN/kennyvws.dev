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
                    className="inline-flex min-h-11 items-center text-[15px] font-medium text-ink-muted transition-colors hover:text-ink"
                  >
                    <span className="link-draw">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
      <Reveal>
        <p className="mt-20 max-w-2xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {contact.closing}
        </p>
      </Reveal>
    </Section>
  );
}
