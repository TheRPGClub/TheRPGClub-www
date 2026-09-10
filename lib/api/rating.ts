// `user_game_reviews.rating` is an integer 0..100 with a CHECK constraint, and
// it is NOT NULL. The UI works in the same units — there is no scaling at the
// boundary any more, so these bounds are the whole contract.
export const MIN_RATING = 0;
export const MAX_RATING = 100;

export function isValidRating(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_RATING &&
    value <= MAX_RATING
  );
}

export function clampRating(value: number): number {
  return Math.max(MIN_RATING, Math.min(MAX_RATING, Math.round(value)));
}

/**
 * Interpret what someone typed into the rating field.
 *
 * Three outcomes, which is why this isn't just a parse:
 *
 * - a number — the new rating, clamped into range
 * - `null` — the field was cleared, so the review has no rating again
 * - `undefined` — ignore what was typed and keep the current rating
 *
 * The field is a text input rather than a number input, so it never has to
 * carry the spinner arrows and this owns the filtering instead: digits are
 * kept, anything else is dropped. Typing a letter is a no-op rather than
 * something that empties the field, which is why "ignore" is distinct from
 * "cleared".
 */
export function parseRatingInput(raw: string): number | null | undefined {
  if (raw.trim() === "") return null;
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return undefined;
  const parsed = Number.parseInt(digits, 10);
  if (Number.isNaN(parsed)) return undefined;
  return clampRating(parsed);
}
