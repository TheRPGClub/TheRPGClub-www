import type { GameCompletion } from "@/lib/api/types";
import {
  completionMonth,
  completionYear,
} from "@/lib/members/member-lists";

// The completed-games page reads a year at a time. Its year dial is built
// from the member's whole completion history (read at the API's largest page
// size), since no endpoint summarises completions by year; the list itself is
// the API's own `year`-filtered, paginated read.

// "2026" | "unknown" | "all"
export type CompletedYearKey = string;

export interface CompletedYearInput {
  userId: string;
  // The whole history, or null when it couldn't be read.
  history: { entries: GameCompletion[]; capped: boolean } | null;
  yearParam: string;
  q: string;
  pageSize: number;
}

const isYear = (key: string) => /^\d{4}$/.test(key);

// The year to show, the dial's years (newest first, undated last), every
// list link, and each month of the shown year with the page it starts on.
export function completedYearView({
  userId,
  history,
  yearParam,
  q,
  pageSize,
}: CompletedYearInput) {
  // Year → count, and year → its completions in the API's order.
  const yearCounts = new Map<string, number>();
  const byYear = new Map<string, GameCompletion[]>();
  for (const entry of history?.entries ?? []) {
    const year = completionYear(entry.completed_at) ?? "unknown";
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    byYear.set(year, [...(byYear.get(year) ?? []), entry]);
  }
  const yearKeys = [...yearCounts.keys()]
    .filter((k) => k !== "unknown")
    .sort((a, b) => b.localeCompare(a));
  if (yearCounts.has("unknown")) yearKeys.push("unknown");

  const valid = (k: string) => k === "all" || k === "unknown" || isYear(k);
  const year: CompletedYearKey = valid(yearParam)
    ? yearParam
    : q || !history || yearKeys.length === 0
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

  // Newest completion first, then newest entry: the page order.
  const monthJumps = new Map<string, { count: number; href: string }>();
  if (isYear(year) && !q) {
    const inYear = [...(byYear.get(year) ?? [])].sort(
      (a, b) =>
        (b.completed_at ?? "").localeCompare(a.completed_at ?? "") ||
        b.created_at.localeCompare(a.created_at),
    );
    inYear.forEach((entry, i) => {
      const month = completionMonth(entry.completed_at);
      if (!month) return;
      const hit = monthJumps.get(month);
      if (hit) hit.count += 1;
      else
        monthJumps.set(month, {
          count: 1,
          href: `${hrefFor(year, Math.floor(i / pageSize) + 1)}#m-${month}`,
        });
    });
  }

  return { year, base, hrefFor, dialYears, monthJumps };
}

export type CompletedYearView = ReturnType<typeof completedYearView>;
