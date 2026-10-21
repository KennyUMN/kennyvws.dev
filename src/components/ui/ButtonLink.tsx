import { cn } from "@/lib/utils";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "accent" | "ink" | "outline";
  className?: string;
}

export function ButtonLink({ href, children, variant = "accent", className }: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex min-h-12 items-center gap-3 px-5 text-[15px] font-semibold transition-[transform,background-color,color] duration-200 active:scale-[0.98]",
        {
          accent: "bg-accent text-accent-ink hover:bg-ink hover:text-surface",
          ink: "bg-ink text-surface hover:bg-ink/85",
          outline: "border border-ink/25 text-ink hover:border-ink",
        }[variant],
        className,
      )}
    >
      {children}
    </a>
  );
}
