// The year dial's data: the years and months it lists, and every month of
// a year with what was finished in it.

export interface DialYear {
  // "2026", or "unknown" for completions with no date.
  key: string;
  label: string;
  count: number;
  href: string;
}

export interface DialMonth {
  key: string; // "2026-08"
  label: string; // "Aug"
  count: number;
  href: string | null; // null: nothing finished that month
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function dialMonths(
  year: string,
  counts: Map<string, { count: number; href: string }>,
): DialMonth[] {
  // Newest month first, to match the strip.
  return MONTH_LABELS.map((label, i) => {
    const key = `${year}-${String(i + 1).padStart(2, "0")}`;
    const hit = counts.get(key);
    return { key, label, count: hit?.count ?? 0, href: hit?.href ?? null };
  }).reverse();
}

export interface YearDialStops {
  years: DialYear[];
  current: string | null;
  months: DialMonth[];
  // The "every year" stop, shown while a search spans all years.
  all?: { href: string; count: number | null; on: boolean };
}
