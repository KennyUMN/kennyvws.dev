import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Section({
  id,
  eyebrow,
  title,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-20 px-6 py-[clamp(4rem,2.5rem+5vw,8.5rem)]", className)}
    >
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <p className="text-sm font-semibold text-accent">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="mt-2 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
        </Reveal>
        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
