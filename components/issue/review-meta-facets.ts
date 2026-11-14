import { MAX_RATING } from "@/lib/api/rating";
import {
  facetLabel,
  isEvenSplit,
  sanitizeReviewFacets,
} from "@/lib/reviews/facets";

export interface ScoredFacet {
  key: string;
  label: string;
  score: number;
  // The facet's share of a weighted card, when the writer moved it off even.
  weight?: number;
}

// The scored facets of a stored scorecard, in the writer's order. Empty for a
// review without one, which is every review from before scorecards existed.
export function scoredFacets(facets: unknown): ScoredFacet[] {
  const card = sanitizeReviewFacets(facets);
  if (!card) return [];
  // Every card the composer writes carries a split; only one the writer
  // moved off even says anything worth showing.
  const weighted = card.weights !== undefined && !isEvenSplit(card);
  return card.order.flatMap((key) => {
    const score = card.scores[key];
    if (score === undefined) return [];
    return [
      {
        key,
        label: facetLabel(key, card.labels),
        score,
        weight: weighted ? card.weights?.[key] : undefined,
      },
    ];
  });
}

// A score's share of the bar, as a CSS length.
export function facetFill(score: number): string {
  return `${Math.max(0, Math.min(100, (score / MAX_RATING) * 100))}%`;
}
