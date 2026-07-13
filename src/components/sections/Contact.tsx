import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { contact, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const socialLinks = [
  { label: "GitHub", href: site.socials.github, Icon: FaGithub },
  { label: "LinkedIn", href: site.socials.linkedin, Icon: FaLinkedinIn },
  { label: "X", href: site.socials.x, Icon: FaXTwitter },
];

export function Contact() {
  return (
    <Section id="contact" eyebrow="Contact" title="Let's talk.">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-lg leading-relaxed text-ink-muted">
            {contact.framing}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href={`mailto:${site.email}`}>{site.email}</ButtonLink>
            <ul className="flex gap-2">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex size-11 items-center justify-center rounded-full border border-edge bg-raised text-ink-muted shadow-soft transition-colors hover:text-ink"
                  >
                    <Icon aria-hidden className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
