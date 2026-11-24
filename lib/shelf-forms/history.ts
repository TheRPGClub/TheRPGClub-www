import type { GameCompletion } from "@/lib/api/types";
import { formatPlaytime } from "@/lib/imports/completionator";
import { ordinal } from "@/lib/utils";
import { dayOf, longDay, type IsoDay } from "./dates";

// The member's Game Completions of one game as the completion dialog's
// timeline shows them (spec api#451, 2B): oldest first, undated ones first
// of all (they were logged before dates were), each with one line of facts.

export interface HistoryNode {
  completionId: number;
  // "14 Mar 2019", or "No date".
  when: string;
  // "Main Story · SNES · 38 h".
  facts: string;
  // The completion the form is editing.
  current: boolean;
}

const SHORT_TYPE: Record<string, string> = {
  "Main Story": "Main Story",
  "Main Story + Side Content": "+ Side Content",
  Completionist: "Completionist",
};

export function completionFacts(entry: GameCompletion): string {
  const platform = entry.platform?.platform_abbreviation ?? entry.platform?.platform_name ?? null;
  const hours = formatPlaytime(entry.final_playtime_hrs);
  return [SHORT_TYPE[entry.completion_type] ?? entry.completion_type, platform, hours]
    .filter(Boolean)
    .join(" · ");
}

function dayText(day: IsoDay | null): string {
  return day ? longDay(day).slice(4) : "No date";
}

export function completionHistory(entries: readonly GameCompletion[], editingId?: number | null): HistoryNode[] {
  return [...entries]
    .sort((a, b) => (dayOf(a.completed_at) ?? "").localeCompare(dayOf(b.completed_at) ?? "") || a.completion_id - b.completion_id)
    .map((entry) => ({
      completionId: entry.completion_id,
      when: dayText(dayOf(entry.completed_at)),
      facts: completionFacts(entry),
      current: entry.completion_id === editingId,
    }));
}

// The tag beside a new completion's title: "2nd time" once there's an
// earlier one, nothing for the first.
export function timesTag(earlier: number): string | undefined {
  return earlier > 0 ? `${ordinal(earlier + 1)} time` : undefined;
}

// The slip's line about the first one, for phones where the timeline is
// folded away: "Your 1st: 14 Mar 2019, Main Story on SNES."
export function firstCompletionLine(entries: readonly GameCompletion[]): { when: string; rest: string } | null {
  const [first] = completionHistory(entries);
  if (!first) return null;
  const entry = entries.find((e) => e.completion_id === first.completionId)!;
  const platform = entry.platform?.platform_abbreviation ?? entry.platform?.platform_name;
  return { when: first.when, rest: `${entry.completion_type}${platform ? ` on ${platform}` : ""}` };
}

export { dayText as historyDay };
