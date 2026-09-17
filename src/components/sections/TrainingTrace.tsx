import { trainingTrace } from "@/data/projects";
import { Reticle } from "@/components/artifacts/Reticle";
import { SignalTrace } from "@/components/artifacts/SignalTrace";

/** The one full-width plate: the scroll-scrubbed training trace, promoted
 *  from a per-row thumbnail to its own instrument panel between Work and
 *  About. Scroll position is the training step — the page's only place
 *  where scroll carries meaning. */
export function TrainingTrace() {
  return (
    <section
      aria-label="Training trace"
      className="px-6 pb-[clamp(4rem,2.5rem+5vw,8.5rem)]"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div>
          <Reticle label={trainingTrace.label}>
            <div className="h-[240px] w-full border border-edge bg-raised p-6 sm:h-[300px]">
              <SignalTrace variant="noisy" />
            </div>
          </Reticle>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            {trainingTrace.provenance}
          </p>
        </div>
      </div>
    </section>
  );
}
