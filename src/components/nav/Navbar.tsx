"use client";

import { useEffect, useRef, useState } from "react";
import { navItems, sectionIds } from "@/data/nav";
import { site } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const SCROLLED_PX = 8;
const SHEET_ITEMS = [...navItems, { id: "resume", label: "Résumé", href: site.resume }];
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const active = useActiveSection(sectionIds);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Reads the scroll position itself: a trigger ending at "max" turns inactive at the very bottom.
  useGSAP(() => {
    ScrollTrigger.create({ onUpdate: (self) => setScrolled(self.scroll() > SCROLLED_PX) });
    setScrolled(window.scrollY > SCROLLED_PX);
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    // While the sheet covers the page, the page behind it leaves the accessibility tree.
    const behind = [document.getElementById("main"), document.querySelector("footer")];
    behind.forEach((el) => el?.toggleAttribute("inert", open));
    return () => {
      document.body.style.overflow = "";
      behind.forEach((el) => el?.removeAttribute("inert"));
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    headerRef.current?.querySelector<HTMLElement>("#mobile-menu a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        headerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Crossing into the desktop layout with the sheet open would strand the scroll lock.
    const mql = window.matchMedia("(min-width: 768px)");
    const onWide = (e: MediaQueryListEvent) => e.matches && setOpen(false);

    window.addEventListener("keydown", onKey);
    mql.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      mql.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    // While the sheet is open, wheel input over the header falls through to the locked native scroll.
    <header ref={headerRef} data-lenis-prevent={open || undefined} className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "relative z-10 border-b transition-colors duration-300",
          scrolled && !open ? "border-rule bg-surface/80 backdrop-blur-xl" : "border-transparent",
        )}
      >
        <nav
          data-intro="nav"
          aria-label="Main"
          className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"
        >
          <a
            href="#top"
            onClick={() => setOpen(false)}
            className="font-wide inline-flex min-h-11 items-center text-[17px] font-extrabold tracking-[-0.02em]"
          >
            {site.name}
          </a>

          <div className="hidden items-center gap-6 md:flex">
            <ul className="flex items-center gap-6 text-[14px] font-medium">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    aria-current={active === item.id ? "true" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center transition-colors",
                      active === item.id ? "text-ink" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    <span className={cn("link-draw", active === item.id && "link-rest")}>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a href={site.resume} className="inline-flex min-h-11 items-center text-[14px] font-medium text-ink">
              <span className="link-draw">Résumé</span>
            </a>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="flex size-11 flex-col items-center justify-center gap-[6px] text-ink"
            >
              <span
                aria-hidden
                className={cn("h-[2px] w-5 bg-current transition-transform duration-200", open && "translate-y-[4px] rotate-45")}
              />
              <span
                aria-hidden
                className={cn("h-[2px] w-5 bg-current transition-transform duration-200", open && "-translate-y-[4px] -rotate-45")}
              />
            </button>
          </div>
        </nav>
      </div>

      <div
        id="mobile-menu"
        data-open={open}
        inert={!open}
        className="group/sheet invisible fixed inset-0 bg-surface pt-16 opacity-0 [transition:opacity_200ms,visibility_0s_200ms] data-[open=true]:visible data-[open=true]:opacity-100 data-[open=true]:[transition:opacity_200ms,visibility_0s] md:hidden motion-reduce:transition-none"
      >
        <ul className="flex flex-col px-5 pt-6 sm:px-8">
          {SHEET_ITEMS.map((item, i) => (
            <li
              key={item.id}
              data-reveal
              className="translate-y-4 border-b border-rule opacity-0 transition-[opacity,translate] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[open=true]/sheet:translate-y-0 group-data-[open=true]/sheet:opacity-100"
              style={{ transitionDelay: open ? `${40 + i * 50}ms` : "0ms" }}
            >
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-wide flex min-h-16 items-center text-4xl font-extrabold tracking-[-0.03em]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
