"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={
        mounted
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
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
