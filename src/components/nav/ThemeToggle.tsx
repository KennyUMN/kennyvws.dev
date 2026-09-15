"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

const FADE_MS = 340;

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const swapTheme = () => {
    const next = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;

    if (!doc.startViewTransition) {
      // No View Transitions — crossfade the colour tokens instead.
      document.documentElement.classList.add("theme-fade");
      setTheme(next);
      window.setTimeout(
        () => document.documentElement.classList.remove("theme-fade"),
        FADE_MS,
      );
      return;
    }

    // Wipe outward from the toggle itself, sized to reach the far corner.
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 0;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const root = document.documentElement;
    root.style.setProperty("--wipe-x", `${x}px`);
    root.style.setProperty("--wipe-y", `${y}px`);
    root.style.setProperty("--wipe-r", `${radius}px`);

    doc.startViewTransition(() => setTheme(next));
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      data-testid="theme-toggle"
      aria-label={
        mounted
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      onClick={swapTheme}
      className="flex size-11 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
    >
      {mounted ? (
        isDark ? (
          <HiOutlineSun aria-hidden className="size-[18px]" />
        ) : (
          <HiOutlineMoon aria-hidden className="size-[18px]" />
        )
      ) : (
        <span aria-hidden className="size-[18px]" />
      )}
    </button>
  );
}
