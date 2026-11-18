import type { DatePrecision } from "./types";

// A Codex date at its precision (a Lore Entry's, a History Event's), as the
// Club Codex surfaces show it and as the desks' Date card writes it (designs
// 2B, 3D, 4D and 5D).

export const DATE_PRECISIONS: readonly DatePrecision[] = ["day", "month", "year"];

export function isDatePrecision(value: unknown): value is DatePrecision {
  return typeof value === "string" && (DATE_PRECISIONS as readonly string[]).includes(value);
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const LONG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// A stored `YYYY-MM-DD` as numbers, or null when it isn't one.
export function dateParts(occurredOn: string | null): { y: number; m: number; d: number } | null {
  const match = occurredOn ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(occurredOn) : null;
  return match ? { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) } : null;
}

// The Lore Entry page's stamp: "12 Aug" over "2020" and "The night of"; "Mar"
// over "2019" and "That month"; "2021" and "That year". Null when undated.
export function dateStamp(
  occurredOn: string | null,
  precision: DatePrecision | null,
): { lines: string[]; note: string } | null {
  const date = dateParts(occurredOn);
  if (!date || !precision) return null;
  const month = SHORT_MONTHS[date.m - 1];
  if (precision === "year") return { lines: [String(date.y)], note: "That year" };
  if (precision === "month") return { lines: [month, String(date.y)], note: "That month" };
  return { lines: [`${date.d} ${month}`, String(date.y)], note: "The night of" };
}

// A spine's date: "12 Aug 2020", "March 2019", "2021" or "Undated".
export function spineDate(occurredOn: string | null, precision: DatePrecision | null): string {
  const date = dateParts(occurredOn);
  if (!date || !precision) return "Undated";
  if (precision === "year") return String(date.y);
  if (precision === "month") return `${LONG_MONTHS[date.m - 1]} ${date.y}`;
  return `${date.d} ${SHORT_MONTHS[date.m - 1]} ${date.y}`;
}

// ---- The desk's Date card ----

export type DateChoice = DatePrecision | "none";

// The card keeps all three parts while a coarser precision greys some out,
// so switching back restores them. Parts are the text typed.
export interface DateDraft {
  choice: DateChoice;
  day: string;
  month: number; // 1-12
  year: string;
}

export function dateDraft(occurredOn: string | null, precision: DatePrecision | null, today = new Date()): DateDraft {
  const date = dateParts(occurredOn);
  if (!date || !precision) {
    return { choice: "none", day: String(today.getDate()), month: today.getMonth() + 1, year: String(today.getFullYear()) };
  }
  return { choice: precision, day: String(date.d), month: date.m, year: String(date.y) };
}

export const MONTH_SHORT = SHORT_MONTHS;

function daysIn(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// The draft as the API takes it, or why it can't be saved.
export function dateFields(
  draft: DateDraft,
): { occurred_on: string | null; date_precision: DatePrecision | null } | { error: string } {
  if (draft.choice === "none") return { occurred_on: null, date_precision: null };
  const year = Number(draft.year);
  if (!/^\d{4}$/.test(draft.year.trim()) || year < 1970 || year > 2100) return { error: "Give the year as four digits." };
  const month = draft.choice === "year" ? 1 : draft.month;
  if (!Number.isInteger(month) || month < 1 || month > 12) return { error: "Pick a month." };
  let day = 1;
  if (draft.choice === "day") {
    day = Number(draft.day);
    if (!/^\d{1,2}$/.test(draft.day.trim()) || day < 1 || day > daysIn(year, month)) {
      return { error: `${LONG_MONTHS[month - 1]} ${year} has no day ${draft.day.trim() || "blank"}.` };
    }
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return { occurred_on: `${year}-${pad(month)}-${pad(day)}`, date_precision: draft.choice };
}
