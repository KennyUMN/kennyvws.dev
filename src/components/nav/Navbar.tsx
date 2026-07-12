"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { navItems, sectionIds } from "@/data/nav";
import { site } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const active = useActiveSection(sectionIds);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const glass = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "border-b transition-colors duration-300",
          glass
            ? "border-edge/70 bg-surface/75 backdrop-blur-xl"
            : "border-transparent"
        )}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6"
        >
          <a
            href="#top"
            className="text-[15px] font-semibold tracking-tight"
            onClick={() => setOpen(false)}
          >
            Kenny
          </a>

          {/* Desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                aria-current={active === item.id ? "true" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  active === item.id
                    ? "bg-surface-muted font-medium text-ink"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {item.label}
              </a>
            ))}
            <a
              href={site.resume}
              className="ml-1 rounded-full px-3.5 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Resume
            </a>
            <div className="ml-1">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="flex size-9 flex-col items-center justify-center gap-[5px] rounded-full text-ink"
            >
              <span
                aria-hidden
                className={cn(
                  "h-[1.5px] w-4 rounded-full bg-current transition-transform duration-200",
                  open && "translate-y-[3.25px] rotate-45"
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "h-[1.5px] w-4 rounded-full bg-current transition-transform duration-200",
                  open && "-translate-y-[3.25px] -rotate-45"
                )}
              />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 top-16 border-b border-edge bg-surface/95 backdrop-blur-xl md:hidden"
            >
              <div className="space-y-1 px-6 pb-8 pt-2">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-lg font-medium transition-colors hover:bg-surface-muted"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href={site.resume}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-lg font-medium text-ink-muted transition-colors hover:bg-surface-muted"
                >
                  Resume
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
