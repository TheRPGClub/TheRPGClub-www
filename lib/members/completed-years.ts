import type { CompletionMonth } from "@/lib/members/completions";

// The completed-games page reads a year at a time. Its year dial and month
// jumps are built from the member's completions tallied by month (the API's
// `completions/months`); the list itself is the API's own `year`-filtered,
// paginated read.

// "2026" | "unknown" | "all"
export type CompletedYearKey = string;

export interface CompletedYearInput {
  userId: string;
  // Every month's tally, or null when they couldn't be read.
  months: CompletionMonth[] | null;
  yearParam: string;
  q: string;
  pageSize: number;
}

const isYear = (key: string) => /^\d{4}$/.test(key);

// The year to show, the dial's years (newest first, undated last), every
// list link, and each month of the shown year with the page it starts on.
export function completedYearView({
  userId,
  months,
  yearParam,
  q,
  pageSize,
}: CompletedYearInput) {
  // Year → count, summed from the month tallies.
  const yearCounts = new Map<string, number>();
  for (const { month, count } of months ?? []) {
    const year = month?.slice(0, 4) ?? "unknown";
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + count);
  }
  const yearKeys = [...yearCounts.keys()]
    .filter((k) => k !== "unknown")
    .sort((a, b) => b.localeCompare(a));
  if (yearCounts.has("unknown")) yearKeys.push("unknown");

  const valid = (k: string) => k === "all" || k === "unknown" || isYear(k);
  const year: CompletedYearKey = valid(yearParam)
    ? yearParam
    : q || !months || yearKeys.length === 0
      ? "all"
      : yearKeys[0];

  const base = `/members/${userId}/completed-games`;
  const hrefFor = (y: CompletedYearKey | null, p = 1, query = q) => {
    const ps = new URLSearchParams();
    if (y) ps.set("year", y);
    if (query) ps.set("q", query);
    if (p > 1) ps.set("page", String(p));
    return `${base}${ps.size ? `?${ps}` : ""}`;
  };

  const dialYears = yearKeys.map((key) => ({
    key,
    label: key === "unknown" ? "No date" : key,
    count: yearCounts.get(key) ?? 0,
    href: hrefFor(key, 1, ""),
  }));

  // The list runs newest completion first, so a year's months run newest
  // first too, and each starts right after the ones before it.
  const monthJumps = new Map<string, { count: number; href: string }>();
  if (isYear(year) && !q) {
    const inYear = (months ?? [])
      .filter((m): m is { month: string; count: number } => m.month?.startsWith(`${year}-`) ?? false)
      .sort((a, b) => b.month.localeCompare(a.month));
    let before = 0;
    for (const { month, count } of inYear) {
      monthJumps.set(month, {
        count,
        href: `${hrefFor(year, Math.floor(before / pageSize) + 1)}#m-${month}`,
      });
      before += count;
    }
  }

  return { year, base, hrefFor, dialYears, monthJumps };
}

export type CompletedYearView = ReturnType<typeof completedYearView>;
