import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-edge px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-ink-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name} · Tangerang, Indonesia
        </p>
        <a href="#top" className="transition-colors hover:text-ink">
          Back to top <span aria-hidden>↑</span>
        </a>
      </div>
    </footer>
  );
}
