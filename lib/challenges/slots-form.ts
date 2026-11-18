import type { ChallengeSchedule, ChallengeSlots } from "@/lib/challenges/types";

// The Slots part of the create and edit form (surface brief challenges-form,
// www#109): the range as two words ("each member's birth year" or a fixed
// year, to "the current year" or a fixed year), Counts past play (Always
// Open only), the year ruler under the sentence and its count line. Pure and
// client-safe; the API owns the rules and refuses what these let through.

export type SlotsFirst = number | "birth_year";
export type SlotsLast = number | "current_year";

export interface SlotsDraft {
  first: SlotsFirst;
  last: SlotsLast;
  countsPastPlay: boolean;
}

export const SLOTS_DEFAULTS: SlotsDraft = { first: "birth_year", last: "current_year", countsPastPlay: false };

// The member the ruler and the count line take as an example for a
// birth-year range (the mock's).
export const EXAMPLE_BIRTH_YEAR = 1988;

// The API's range of years.
export const FIRST_ALLOWED = 1900;
export const LAST_ALLOWED = 2100;

export function slotsDraftFrom(slots: ChallengeSlots | null | undefined): SlotsDraft {
  if (!slots) return { ...SLOTS_DEFAULTS };
  return { first: slots.first_year, last: slots.last_year, countsPastPlay: slots.counts_past_play };
}

// The `slots` the API takes. Counts past play is for Always Open Challenges
// only, so a Seasonal one never sends it on.
export function slotsRequest(draft: SlotsDraft, schedule: ChallengeSchedule): ChallengeSlots {
  return {
    first_year: draft.first,
    last_year: draft.last,
    counts_past_play: schedule === "always_open" && draft.countsPastPlay,
  };
}

export type SlotsErrors = Partial<Record<"slotsFirst" | "slotsLast", string>>;

const outOfRange = (year: number) => !Number.isInteger(year) || year < FIRST_ALLOWED || year > LAST_ALLOWED;
const RANGE = `Pick a year from ${FIRST_ALLOWED} to ${LAST_ALLOWED}.`;

export function slotsErrors(draft: SlotsDraft, currentYear: number): SlotsErrors {
  const errors: SlotsErrors = {};
  if (typeof draft.first === "number" && outOfRange(draft.first)) errors.slotsFirst = RANGE;
  if (typeof draft.last === "number" && outOfRange(draft.last)) errors.slotsLast = RANGE;
  if (errors.slotsFirst || typeof draft.first !== "number") return errors;
  if (typeof draft.last === "number") {
    if (!errors.slotsLast && draft.first > draft.last) errors.slotsFirst = "The first year can't come after the last year.";
  } else if (draft.first > currentYear) {
    errors.slotsFirst = "The first year can't come after this year.";
  }
  return errors;
}

const slots = (n: number) => `${n} ${n === 1 ? "slot" : "slots"}`;

// The line under the ruler: how many slots the range means.
export function slotsCountLine(draft: SlotsDraft, currentYear: number): string {
  const growing = draft.last === "current_year";
  const last = growing ? currentYear : (draft.last as number);
  const first = draft.first === "birth_year" ? EXAMPLE_BIRTH_YEAR : draft.first;
  const count = Math.max(last - first + 1, 0);
  const more = growing ? ", plus one every 1 January" : "";
  if (draft.first === "birth_year") return `For a member born ${first} that's ${slots(count)}${more}.`;
  return `That's ${slots(count)}${growing ? " so far" : ""}${more}.`;
}

export interface RulerScale {
  start: number;
  end: number;
  // A tick every 2 years from the start, labelled every 10.
  ticks: { year: number; label: boolean }[];
  // Where the two handles stand: the first year (the example member's for a
  // birth-year range) and the last (this year while it grows).
  values: [number, number];
  percent: (year: number) => number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

export function rulerScale(draft: SlotsDraft, currentYear: number): RulerScale {
  const fixedFirst = typeof draft.first === "number" && !outOfRange(draft.first) ? draft.first : null;
  const fixedLast = typeof draft.last === "number" && !outOfRange(draft.last) ? draft.last : null;
  const start = Math.min(1970, fixedFirst !== null ? Math.floor(fixedFirst / 10) * 10 : 1970);
  const end = Math.max(currentYear, fixedLast ?? currentYear);
  const last = fixedLast ?? currentYear;
  const first = clamp(fixedFirst ?? EXAMPLE_BIRTH_YEAR, start, last);
  const ticks = [];
  for (let year = start; year <= end; year += 2) ticks.push({ year, label: year % 10 === 0 });
  return {
    start,
    end,
    ticks,
    values: [first, last],
    percent: (year) => (end === start ? 0 : ((year - start) / (end - start)) * 100),
  };
}

// The last handle dragged to this year makes the range grow with the years.
export function lastFromRuler(year: number, currentYear: number): SlotsLast {
  return year === currentYear ? "current_year" : year;
}
