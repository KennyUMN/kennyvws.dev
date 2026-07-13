import { posts } from "@/data/posts";
import { formatDate } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Writing() {
  return (
    <Section
      id="writing"
      eyebrow="Writing"
      title="Notes in draft — coming soon."
    >
      <ul className="divide-y divide-edge border-y border-edge">
        {posts.map((post, i) => (
          <li key={post.title}>
            <Reveal delay={i * 0.05}>
              <div className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {post.title}
                    </h3>
                    <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                      Draft
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                    {post.excerpt}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-ink-muted">
                  {post.tag} · {formatDate(post.date)} · {post.readTime}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
