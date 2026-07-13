import { posts } from "@/data/posts";
import { formatDate } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Writing() {
  return (
    <Section id="writing" title="Notes in draft, coming soon.">
      <ul className="divide-y divide-edge border-y border-edge">
        {posts.map((post, i) => (
          <li key={post.title}>
            <Reveal delay={i * 0.05}>
              <div className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold tracking-tight">{post.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                    {post.excerpt}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-ink-muted">
                  Draft · {post.tag} · {formatDate(post.date)}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
