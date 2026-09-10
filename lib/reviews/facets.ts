// The review scorecard: the per-category scores that sit beside a review's
// overall rating.
//
// The catalogue is fixed rather than free-form for two reasons. A stored key
// has to mean the same thing in every review for the club to average anything
// by it — "the GOTM winner averages 91 on music" is only a sentence if `music`
// is one column and not fifteen spellings of one. And every key needs a label
// to render, which a reviewer-invented one would not have.
//
// Mirrored by `UserGameReview::FACET_KEYS` on the API, which validates against
// the same list. Adding a facet means adding it in both places.
//
// The catalogue is a starting point, not a cage. A template seeds a card, and
// from there every row can be renamed, reordered, removed or joined by a new
// one. Two kinds of key can sit on a card:
//
//   - a catalogue key (`music`), which survives being renamed — the label is
//     a display override, so a row called "Soundtrack" still counts as `music`
//     wherever the club later averages music scores
//   - a custom key (`custom:1`), invented on this card, carrying whatever name
//     the reviewer gave it. Per-review by nature: nothing else knows what it
//     means, which is the cost of a free-text field and the reason renaming a
//     catalogue row is the better move where one fits.

// Same 0..100 scale as the overall rating, deliberately — a reviewer should
// not have to hold two scales in their head at once.
import { MAX_RATING, MIN_RATING } from "@/lib/api/rating";

export interface ReviewFacetDef {
  key: ReviewFacetKey;
  label: string;
  // What the facet is asking about. Shown on the composer rows, where the
  // whole point of a template is to make the grading easier — a bare "Value"
  // invites five different readings.
  hint: string;
}

// Ordered: this is the order the Custom picker offers them in, and the order
// a custom scorecard falls back to.
export const REVIEW_FACETS = [
  {
    key: "story",
    label: "Story",
    hint: "Plot, structure, and whether the ending earns what came before.",
  },
  {
    key: "characters",
    label: "Characters",
    hint: "The cast, their arcs, and whether you ended up caring.",
  },
  {
    key: "combat",
    label: "Combat & Systems",
    hint: "Battles, builds, and the mechanics holding them up.",
  },
  {
    key: "world",
    label: "World & Exploration",
    hint: "The place itself, and what it gives back for poking at it.",
  },
  {
    key: "music",
    label: "Music & Sound",
    hint: "Soundtrack, effects, and the mix between them.",
  },
  {
    key: "visuals",
    label: "Visuals",
    hint: "How it looks, and how well the hardware holds that look up.",
  },
  {
    key: "pacing",
    label: "Pacing",
    hint: "Whether it earns its length or asks you to sit through it.",
  },
  {
    key: "gameplay",
    label: "Gameplay",
    hint: "The moment-to-moment play, in whatever form the game takes.",
  },
  {
    key: "replayability",
    label: "Replayability",
    hint: "Reasons to start again once the credits have rolled.",
  },
  {
    key: "difficulty",
    label: "Difficulty & Balance",
    hint: "Challenge, fairness, and the options to tune either.",
  },
  {
    key: "writing",
    label: "Writing & Localisation",
    hint: "Dialogue, prose, and the quality of the translation.",
  },
  {
    key: "performance",
    label: "Performance",
    hint: "Frame rate, load times, and what it does when it breaks.",
  },
  {
    key: "value",
    label: "Value & Length",
    hint: "What the asking price actually buys.",
  },
  {
    key: "art_direction",
    label: "Art Direction",
    hint: "The look it reached for, judged apart from the tech.",
  },
  {
    key: "voice_acting",
    label: "Voice Acting",
    hint: "Performances and casting, where there are any.",
  },
] as const satisfies readonly {
  key: string;
  label: string;
  hint: string;
}[];

// A key from the shipped catalogue.
export type ReviewFacetKey = (typeof REVIEW_FACETS)[number]["key"];

// Any key a card may carry: a catalogue key, or a custom one.
export type FacetKey = string;

const FACET_BY_KEY = new Map<string, ReviewFacetDef>(
  REVIEW_FACETS.map((facet) => [facet.key, facet as ReviewFacetDef]),
);

// Custom keys are numbered rather than slugged from the name. A slug would
// have to change every time the name is edited, dragging the row's score and
// weight along with it and colliding with whatever else was mid-rename. The
// number is arbitrary and stable; the label is what carries the meaning.
const CUSTOM_KEY = /^custom:[1-9][0-9]{0,3}$/;

export const MAX_LABEL_LENGTH = 40;

export function isCatalogueKey(value: unknown): value is ReviewFacetKey {
  return typeof value === "string" && FACET_BY_KEY.has(value);
}

export function isCustomKey(value: unknown): value is FacetKey {
  return typeof value === "string" && CUSTOM_KEY.test(value);
}

export function isFacetKey(value: unknown): value is FacetKey {
  return isCatalogueKey(value) || isCustomKey(value);
}

export function facetDef(key: FacetKey): ReviewFacetDef | undefined {
  return FACET_BY_KEY.get(key);
}

/**
 * What a row is called: the reviewer's own name for it, else the catalogue's,
 * else nothing. A custom row without a label is not a row at all — the
 * sanitizer drops it rather than render a blank.
 */
export function facetLabel(
  key: FacetKey,
  labels: Record<string, string> | undefined,
): string {
  const custom = labels?.[key]?.trim();
  if (custom) return custom;
  return facetDef(key)?.label ?? "";
}

/**
 * The catalogue's prompt for a row, or null for a custom one — nobody can
 * write the hint for a field they have just invented.
 */
export function facetHint(key: FacetKey): string | null {
  return facetDef(key)?.hint ?? null;
}

/**
 * A free key for a new custom row on this card. Numbers are never reused
 * within a card, so removing `custom:2` and adding another gives `custom:3` —
 * a recycled key would inherit the removed row's score if an edit raced it.
 */
export function nextCustomKey(order: FacetKey[]): FacetKey {
  let highest = 0;
  for (const key of order) {
    const match = /^custom:([0-9]+)$/.exec(key);
    if (match) highest = Math.max(highest, Number.parseInt(match[1], 10));
  }
  return `custom:${highest + 1}`;
}

// Which preset a scorecard came from. "quick" is not stored — a quick take is
// a review with no facets at all, which is also the shape every review written
// before the scorecard existed already has. Keeping it out of the stored set
// means "no scorecard" has exactly one representation.
export type ReviewTemplateKey = "rpg" | "general" | "custom";
export type ReviewTemplateChoice = ReviewTemplateKey | "quick";

export interface ReviewTemplateDef {
  key: ReviewTemplateChoice;
  label: string;
  // The one-liner under the picker, so choosing between four chips doesn't
  // require opening each one to see what it holds.
  blurb: string;
  facets: readonly ReviewFacetKey[];
}

export const REVIEW_TEMPLATES = [
  {
    key: "quick",
    label: "Quick take",
    blurb: "Just the overall score and what you wrote.",
    facets: [],
  },
  {
    key: "rpg",
    label: "RPG",
    blurb: "The seven the club argues about most.",
    facets: [
      "story",
      "characters",
      "combat",
      "world",
      "music",
      "visuals",
      "pacing",
    ],
  },
  {
    key: "general",
    label: "General game",
    blurb: "For anything the RPG axes don't fit.",
    facets: ["gameplay", "story", "music", "visuals", "replayability"],
  },
  {
    key: "custom",
    label: "Custom",
    blurb: "Pick and order your own.",
    // Seeded from whatever is already on the card — see `applyTemplate`.
    facets: [],
  },
] as const satisfies readonly ReviewTemplateDef[];

export const MAX_FACETS = 12;

// Weights are a share of a hundred-point budget, the way a formal rubric
// splits one. Absent means unweighted — every scored facet counts once — which
// is what most scorecards will store, and keeps them byte-identical to what
// they stored before weights existed.
export const WEIGHT_TOTAL = 100;

export interface ReviewFacets {
  // Which preset this card was last built from. Provenance, not a constraint:
  // every template is editable, so this records where the card started rather
  // than what it is now. `matchesTemplate` says whether it still matches.
  template: ReviewTemplateKey;
  // The scorecard's facets, in display order. Its own array because jsonb does
  // not preserve object key order, so the order cannot be implied by `scores`
  // — and because a facet can be on the card without a score yet.
  order: FacetKey[];
  // Display names, stored only where they add something: a catalogue row keeps
  // its catalogue label unless renamed, a custom row must have one.
  labels?: Record<string, string>;
  scores: Record<string, number>;
  // Present only on a weighted scorecard. When present the invariant is
  // exact: a key for every facet in `order`, nothing else, integers summing to
  // WEIGHT_TOTAL. Anything looser is not stored — see `weightsError`.
  weights?: Record<string, number>;
}

function isStoredTemplate(value: unknown): value is ReviewTemplateKey {
  return value === "rpg" || value === "general" || value === "custom";
}

/**
 * Any stored `facets` value, normalized into a scorecard, or null when there
 * is nothing worth showing.
 *
 * Tolerant on purpose, the same way `sanitizeReviewValue` is for bodies: this
 * runs over unvalidated JSON off the wire and over what the composer is about
 * to send, and in both cases dropping a facet the catalogue has since lost
 * beats refusing to render the six that are still fine. The API's own
 * validation is the strict boundary.
 */
export function sanitizeReviewFacets(value: unknown): ReviewFacets | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;

  const rawLabels =
    record.labels != null &&
    typeof record.labels === "object" &&
    !Array.isArray(record.labels)
      ? (record.labels as Record<string, unknown>)
      : {};

  const rawOrder = Array.isArray(record.order) ? record.order : [];
  const order: FacetKey[] = [];
  const labels: Record<string, string> = {};
  for (const key of rawOrder) {
    if (!isFacetKey(key) || order.includes(key)) continue;

    const raw = rawLabels[key];
    const label =
      typeof raw === "string" ? raw.trim().slice(0, MAX_LABEL_LENGTH) : "";

    // A custom row is nothing but its name. Without one there is no row to
    // render and no way to say what the score meant, so it goes.
    if (!label && isCustomKey(key)) continue;

    order.push(key);
    // Stored only where it says something the catalogue doesn't. A row
    // renamed back to its catalogue label leaves no trace, so the card cannot
    // accumulate no-op overrides.
    if (label && label !== facetDef(key)?.label) labels[key] = label;
    if (order.length >= MAX_FACETS) break;
  }
  if (order.length === 0) return null;

  const scores: Record<string, number> = {};
  const rawScores =
    record.scores != null &&
    typeof record.scores === "object" &&
    !Array.isArray(record.scores)
      ? (record.scores as Record<string, unknown>)
      : {};
  for (const key of order) {
    const score = rawScores[key];
    // A score outside the scale, or for a facet no longer on the card, is
    // dropped rather than clamped — it was never a score this UI could have
    // produced, so guessing at what it meant would be inventing one.
    if (
      typeof score === "number" &&
      Number.isInteger(score) &&
      score >= MIN_RATING &&
      score <= MAX_RATING
    ) {
      scores[key] = score;
    }
  }

  const facets: ReviewFacets = {
    template: isStoredTemplate(record.template) ? record.template : "custom",
    order,
    scores,
  };
  if (Object.keys(labels).length > 0) facets.labels = labels;

  // Weights are all-or-nothing: a set that doesn't cover the card exactly, or
  // doesn't add up, is dropped rather than repaired. Repairing it would mean
  // inventing a split nobody chose, and an unweighted scorecard still reads
  // correctly. `weightsError` is what stops a bad set reaching here from the
  // composer in the first place.
  const weights = readWeights(record.weights, order);
  if (weights) facets.weights = weights;

  return facets;
}

function readWeights(
  raw: unknown,
  order: FacetKey[],
): Record<string, number> | undefined {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return undefined;
  }
  const record = raw as Record<string, unknown>;
  if (Object.keys(record).length !== order.length) return undefined;

  const weights: Record<string, number> = {};
  let total = 0;
  for (const key of order) {
    const weight = record[key];
    if (
      typeof weight !== "number" ||
      !Number.isInteger(weight) ||
      weight < 0 ||
      weight > WEIGHT_TOTAL
    ) {
      return undefined;
    }
    weights[key] = weight;
    total += weight;
  }
  return total === WEIGHT_TOTAL ? weights : undefined;
}

/**
 * How many of the scorecard's facets have actually been scored.
 */
export function scoredCount(facets: ReviewFacets | null): number {
  if (!facets) return 0;
  return facets.order.filter((key) => facets.scores[key] !== undefined).length;
}

/**
 * The mean of the scored facets, rounded, or null when none are scored.
 * Weighted by the card's own split where it has one.
 *
 * Only ever a suggestion. The overall rating stays authored — a reviewer is
 * allowed to land on 90 for a game whose parts average 78, and that gap is
 * usually the most interesting thing in the review.
 *
 * Unscored facets are left out of both the sum and the divisor, so a
 * half-filled card averages what is actually on it rather than counting the
 * blanks as zero.
 */
export function facetAverage(facets: ReviewFacets | null): number | null {
  if (!facets) return null;
  const scored = facets.order.filter(
    (key) => facets.scores[key] !== undefined,
  );
  if (scored.length === 0) return null;

  const weights = facets.weights;
  if (weights) {
    const total = scored.reduce((sum, key) => sum + (weights[key] ?? 0), 0);
    // Every scored facet weighted at zero leaves nothing to divide by. That is
    // reachable (weight the blanks, score the rest at 0%), so it falls back to
    // the plain mean rather than reporting no average at all.
    if (total > 0) {
      const weighted = scored.reduce(
        (sum, key) => sum + facets.scores[key]! * (weights[key] ?? 0),
        0,
      );
      return Math.round(weighted / total);
    }
  }

  return Math.round(
    scored.reduce((sum, key) => sum + facets.scores[key]!, 0) / scored.length,
  );
}

/**
 * Whether the card carries a weighting, as opposed to counting every facet
 * once.
 */
export function isWeighted(facets: ReviewFacets | null): boolean {
  return facets?.weights !== undefined;
}

/**
 * An equal split of the budget across `order`, to the whole point.
 *
 * Seven facets don't divide into a hundred, so the remainder goes to the
 * facets nearest the top of the card — someone has to carry the extra point,
 * and spreading it silently to the last rows would look like a typo.
 */
export function evenWeights(
  order: FacetKey[],
): Record<string, number> {
  const weights: Record<string, number> = {};
  if (order.length === 0) return weights;

  const base = Math.floor(WEIGHT_TOTAL / order.length);
  let spare = WEIGHT_TOTAL - base * order.length;
  for (const key of order) {
    weights[key] = base + (spare > 0 ? 1 : 0);
    if (spare > 0) spare -= 1;
  }
  return weights;
}

/**
 * Scale a set of weights back onto the budget, keeping their proportions.
 *
 * Integers have to sum to exactly WEIGHT_TOTAL, so this uses largest-remainder
 * apportionment: floor everything, then hand the leftover points to whichever
 * facets lost the most in the rounding. Plain rounding would routinely land on
 * 99 or 101.
 */
export function rebalanceWeights(
  order: FacetKey[],
  raw: Record<string, number>,
): Record<string, number> {
  if (order.length === 0) return {};

  const total = order.reduce((sum, key) => sum + Math.max(0, raw[key] ?? 0), 0);
  if (total <= 0) return evenWeights(order);

  const exact = order.map(
    (key) => (Math.max(0, raw[key] ?? 0) * WEIGHT_TOTAL) / total,
  );
  const floors = exact.map(Math.floor);
  let spare = WEIGHT_TOTAL - floors.reduce((sum, value) => sum + value, 0);

  const byRemainder = order
    .map((_, index) => index)
    .sort((a, b) => exact[b] - floors[b] - (exact[a] - floors[a]));
  for (let i = 0; spare > 0; i += 1, spare -= 1) {
    floors[byRemainder[i % byRemainder.length]] += 1;
  }

  const weights: Record<string, number> = {};
  order.forEach((key, index) => {
    weights[key] = floors[index];
  });
  return weights;
}

/**
 * Weights carried onto a new set of facets, or undefined for an unweighted
 * card.
 *
 * Used for the structural edits — adding a facet, removing one, switching
 * template — where nothing the reviewer typed is being overwritten, so the
 * split can rebalance itself. A facet that survives keeps its share; a new one
 * arrives on an even share; the result is scaled back to the budget. Typing a
 * weight deliberately does *not* go through here: see `weightsError`.
 */
export function deriveWeights(
  order: FacetKey[],
  previous: Record<string, number> | undefined,
): Record<string, number> | undefined {
  if (!previous) return undefined;
  if (order.length === 0) return undefined;

  const evenShare = WEIGHT_TOTAL / order.length;
  const seeded: Record<string, number> = {};
  for (const key of order) {
    seeded[key] = previous[key] ?? evenShare;
  }
  return rebalanceWeights(order, seeded);
}

/**
 * Whether the card's weights are exactly the even split of its facets — the
 * arithmetic equivalent of not weighting it at all.
 *
 * The composer shows weights on every card, so most cards carry an even split
 * nobody chose. The read view uses this to keep those off the page: a column
 * of "15%" beside every row tells a reader nothing except that the writer left
 * the defaults alone.
 */
export function isEvenSplit(facets: ReviewFacets | null): boolean {
  if (!facets?.weights) return false;
  const even = evenWeights(facets.order);
  return facets.order.every((key) => facets.weights?.[key] === even[key]);
}

/**
 * The card with a weighting guaranteed — an even split where it had none.
 *
 * Weights are part of the composer rather than something to switch on, so a
 * card always arrives at the editor with a split to adjust. Cards written
 * before that was true have none stored, and get the even split that matches
 * how they were being averaged anyway.
 */
export function ensureWeights(
  facets: ReviewFacets | null,
): ReviewFacets | null {
  if (!facets || facets.weights) return facets;
  if (facets.order.length === 0) return facets;
  return { ...facets, weights: evenWeights(facets.order) };
}

export function weightsTotal(facets: ReviewFacets | null): number {
  if (!facets?.weights) return 0;
  return facets.order.reduce(
    (sum, key) => sum + (facets.weights?.[key] ?? 0),
    0,
  );
}

/**
 * Why this card's weights cannot be saved, or null when they can.
 *
 * The invariant is exact — one share per facet, integers, adding to the budget
 * — because a stored split that doesn't add up is a split whose meaning
 * depends on who reads it. The composer blocks on this rather than quietly
 * normalising: rewriting a number someone just typed is worse than telling
 * them it doesn't add up yet.
 */
export function weightsError(facets: ReviewFacets | null): string | null {
  if (!facets?.weights) return null;

  const weights = facets.weights;
  for (const key of facets.order) {
    const weight = weights[key];
    if (
      typeof weight !== "number" ||
      !Number.isInteger(weight) ||
      weight < 0 ||
      weight > WEIGHT_TOTAL
    ) {
      return `Give ${facetLabel(key, facets.labels)} a weight between 0 and ${WEIGHT_TOTAL}%.`;
    }
  }

  const total = weightsTotal(facets);
  if (total === WEIGHT_TOTAL) return null;
  return total > WEIGHT_TOTAL
    ? `Category weights add up to ${total}% — ${total - WEIGHT_TOTAL}% over.`
    : `Category weights add up to ${total}% — ${WEIGHT_TOTAL - total}% still to give.`;
}

/**
 * Which template chip a stored scorecard should show as selected.
 */
export function templateChoice(facets: ReviewFacets | null): ReviewTemplateChoice {
  return facets?.template ?? "quick";
}

/**
 * Whether the card still looks like the preset it came from — same facets, in
 * the same order, under their catalogue names.
 *
 * Drives the "edited" marker only. Nothing depends on the answer, because a
 * template is a starting point and a card that has moved on from one is not
 * in an invalid state.
 */
export function matchesTemplate(facets: ReviewFacets | null): boolean {
  if (!facets) return true;
  const preset = REVIEW_TEMPLATES.find(
    (template) => template.key === facets.template,
  );
  if (!preset || facets.template === "custom") return false;
  if (facets.order.length !== preset.facets.length) return false;
  if (facets.order.some((key, index) => key !== preset.facets[index])) {
    return false;
  }
  // A renamed row is an edited card even when the list is untouched.
  return Object.keys(facets.labels ?? {}).length === 0;
}

/**
 * Switch a scorecard to another template, keeping the scores of any facet the
 * new template also carries.
 *
 * Switching is not destructive: moving RPG → General keeps story, music and
 * visuals, and moving anything → Custom keeps the card exactly as it stands
 * and merely unlocks editing it. Returns null for "quick", which is what a
 * review with no scorecard stores.
 */
export function applyTemplate(
  current: ReviewFacets | null,
  choice: ReviewTemplateChoice,
): ReviewFacets | null {
  if (choice === "quick") return null;

  const order =
    choice === "custom"
      ? (current?.order ?? [])
      : [
          ...(REVIEW_TEMPLATES.find((template) => template.key === choice)
            ?.facets ?? []),
        ];

  // Custom with nothing carried over is a legitimate empty card the reviewer
  // is about to fill from the picker, so it keeps its shape rather than
  // collapsing back to a quick take.
  const scores: Record<string, number> = {};
  for (const key of order) {
    const score = current?.scores[key];
    if (score !== undefined) scores[key] = score;
  }

  const next: ReviewFacets = { template: choice, order, scores };

  const labels: Record<string, string> = {};
  for (const key of order) {
    const label = current?.labels?.[key];
    if (label) labels[key] = label;
  }
  if (Object.keys(labels).length > 0) next.labels = labels;

  const weights = deriveWeights(order, current?.weights);
  if (weights) next.weights = weights;
  return ensureWeights(next);
}
