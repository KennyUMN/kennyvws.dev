import { cn } from "@/lib/utils";

export function ButtonLink({
  href,
  variant = "primary",
  external = false,
  children,
  className,
}: {
  href: string;
  variant?: "primary" | "quiet";
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-[transform,background-color,color,box-shadow] duration-200 active:scale-[0.98]",
        variant === "primary" &&
          "bg-accent text-accent-contrast shadow-soft hover:opacity-90",
        variant === "quiet" &&
          "border border-edge bg-raised text-ink shadow-soft hover:bg-surface-muted",
        className
      )}
    >
      {children}
    </a>
  );
}
