import { cn } from "@/lib/utils";

interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  resting?: boolean;
  className?: string;
}

/** Text link with a 44px hit area; the underline draws on hover and focus. */
export function TextLink({ href, children, external, resting, className }: TextLinkProps) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn("group inline-flex min-h-11 items-center gap-1.5", className)}
    >
      <span className={cn("link-draw", resting && "link-rest")}>{children}</span>
      {external && (
        <span aria-hidden className="text-[0.85em] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          ↗
        </span>
      )}
    </a>
  );
}
