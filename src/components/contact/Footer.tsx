import { site } from "@/data/site";
import { TextLink } from "@/components/ui/TextLink";
import { Signoff } from "./Signoff";

export function Footer() {
  return (
    <footer>
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Signoff word={site.name.toUpperCase()} />
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-rule px-5 py-4 font-mono text-[11px] text-ink-2 sm:px-8 lg:px-12">
        <p>
          © {new Date().getFullYear()} {site.name} · {site.location}
        </p>
        <TextLink href="#top">Back to top</TextLink>
      </div>
    </footer>
  );
}
