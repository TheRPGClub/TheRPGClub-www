import { scoredFacets } from "@/components/issue/review-meta";
import type { ReviewFacets } from "@/lib/api/types";
import { signedChange } from "@/lib/reviews/takes";

const LABEL = "font-label font-extrabold tracking-[0.08em] uppercase";

// A take's own scorecard in the right margin: each category's score, with
// its change from the take before when that one scored it too. A take
// scored without one says so in a line.
export function TakeScorecard({
  facets,
  previous,
}: {
  facets: ReviewFacets | null;
  previous: ReviewFacets | null | undefined;
}) {
  const scored = scoredFacets(facets);
  const before = new Map(scoredFacets(previous).map((f) => [f.key, f.score]));
  return (
    <section aria-label="This take's scorecard" className="border-t border-border pt-2.5 md:max-w-sm">
      <h4 className={`${LABEL} m-0 mb-1 text-[0.74rem] text-dim-foreground`}>This take&apos;s scorecard</h4>
      {scored.length === 0 ? (
        <p className="m-0 py-1 text-[0.86rem] text-faint-foreground">One overall score, no categories.</p>
      ) : (
        <dl className="m-0">
          {scored.map((f) => {
            const was = before.get(f.key);
            return (
              <div key={f.key} className="grid grid-cols-[1fr_auto_30px] items-baseline gap-2 py-1">
                <dt className={`${LABEL} text-[0.76rem] text-faint-foreground`}>{f.label}</dt>
                <dd className="font-headline m-0 text-[1.35rem] leading-none">{f.score}</dd>
                <dd className={`${LABEL} m-0 text-right text-[0.72rem] tracking-[0.04em] text-faint-foreground`}>
                  {was === undefined ? "" : signedChange(f.score, was)}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}
