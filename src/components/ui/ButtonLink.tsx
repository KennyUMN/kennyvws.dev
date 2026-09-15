import { cn } from "@/lib/utils";

export function ButtonLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[15px] font-medium text-accent-contrast shadow-soft transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </a>
  );
}
