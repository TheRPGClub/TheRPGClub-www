import {
  MAX_LABEL_LENGTH,
  REVIEW_FACETS,
  WEIGHT_TOTAL,
  deriveWeights,
  ensureWeights,
  evenWeights,
  facetDef,
  nextCustomKey,
  weightsTotal,
  type FacetKey,
  type ReviewFacets,
} from "./facets";

// The edits the scorecard editor makes to a card, one function per control.
// Each takes the card as it stands and returns the next one; none of them
// mutates its input.

const withWeights = (next: ReviewFacets) => ensureWeights(next) ?? next;

export function withScore(card: ReviewFacets, key: FacetKey, score: number | null): ReviewFacets {
  const scores = { ...card.scores };
  if (score === null) {
    delete scores[key];
  } else {
    scores[key] = score;
  }
  return { ...card, scores };
}

/**
 * The card with these facets, in this order.
 *
 * Dropping a facet drops its score with it, so a removed row can never keep
 * contributing to the average from off the card. A structural edit
 * overwrites nothing the reviewer typed, so the budget re-apportions itself
 * rather than being left short. Typing a weight is the opposite case and
 * deliberately does not come through here.
 */
export function withOrder(card: ReviewFacets, order: FacetKey[]): ReviewFacets {
  const scores: Record<string, number> = {};
  for (const key of order) {
    const score = card.scores[key];
    if (score !== undefined) scores[key] = score;
  }
  const labels: Record<string, string> = {};
  for (const key of order) {
    const label = card.labels?.[key];
    if (label) labels[key] = label;
  }

  const next: ReviewFacets = { ...card, order, scores };
  if (Object.keys(labels).length > 0) {
    next.labels = labels;
  } else {
    delete next.labels;
  }
  const weights = deriveWeights(order, card.weights);
  if (weights) {
    next.weights = weights;
  } else {
    delete next.weights;
  }
  return withWeights(next);
}

export function withWeight(card: ReviewFacets, key: FacetKey, weight: number): ReviewFacets {
  if (!card.weights) return card;
  return { ...card, weights: { ...card.weights, [key]: weight } };
}

// Renaming a catalogue row back to its own name leaves no override, so a card
// cannot silently accumulate labels that say nothing.
export function withLabel(card: ReviewFacets, key: FacetKey, label: string): ReviewFacets {
  const labels = { ...card.labels };
  const trimmed = label.slice(0, MAX_LABEL_LENGTH);
  if (!trimmed.trim() || trimmed === facetDef(key)?.label) {
    delete labels[key];
  } else {
    labels[key] = trimmed;
  }
  const next: ReviewFacets = { ...card, labels };
  if (Object.keys(labels).length === 0) delete next.labels;
  return next;
}

/**
 * The card with one more row of the reviewer's own, and that row's key.
 *
 * Named up front: a custom row is nothing but its name, and the sanitizer
 * drops one that has none. The reviewer types over this straight away.
 */
export function withCustomFacet(card: ReviewFacets): { card: ReviewFacets; key: FacetKey } {
  const key = nextCustomKey(card.order);
  const order = [...card.order, key];
  const labels = { ...card.labels, [key]: "New category" };
  const next: ReviewFacets = { ...card, order, labels };
  const weights = deriveWeights(order, card.weights);
  if (weights) next.weights = weights;
  return { card: withWeights(next), key };
}

// "Even split" is offered whenever it would change something, so a card
// already sitting on an even split doesn't advertise a no-op button.
export function canEvenSplit(card: ReviewFacets): boolean {
  const evenlySplit =
    card.weights !== undefined &&
    JSON.stringify(card.weights) === JSON.stringify(evenWeights(card.order));
  return !(weightsTotal(card) === WEIGHT_TOTAL && evenlySplit);
}

// The catalogue facets not on the card yet, in catalogue order.
export function unpickedFacets(card: ReviewFacets | null) {
  return REVIEW_FACETS.filter((facet) => !card?.order.includes(facet.key));
}
