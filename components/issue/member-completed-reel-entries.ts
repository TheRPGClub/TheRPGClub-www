import type { GameCompletion } from "@/lib/api/types";
import { completionMonth, monthLabel, playtimeHours } from "@/lib/members/member-lists";

// The completed reel's data: the page's completions grouped by month, and
// the facts its spotlight lists for one completion.

export interface ReelGroup {
  key: string;
  label: string;
  entries: { entry: GameCompletion; index: number }[];
}

export interface ReelFact {
  big: string;
  small: string;
}

export function groupByMonth(entries: GameCompletion[]): ReelGroup[] {
  const groups: ReelGroup[] = [];
  entries.forEach((entry, index) => {
    const key = completionMonth(entry.completed_at) ?? "undated";
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = {
        key,
        label: key === "undated" ? "No date" : monthLabel(key),
        entries: [],
      };
      groups.push(group);
    }
    group.entries.push({ entry, index });
  });
  return groups;
}

function finishedOn(iso: string | null): ReelFact | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return {
    big: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
    small: `${date.getUTCFullYear()} · Finished`,
  };
}

export function reelFacts(current: GameCompletion): ReelFact[] {
  const finished = finishedOn(current.completed_at);
  const hours = playtimeHours(current.final_playtime_hrs);
  const platform =
    current.platform?.platform_abbreviation ??
    current.platform?.platform_code ??
    current.platform?.platform_name ??
    null;
  return [
    finished && { big: finished.big, small: finished.small },
    hours && { big: hours, small: "Final playtime" },
    platform && { big: platform, small: "Platform" },
    current.completion_type && {
      big: current.completion_type,
      small: "Completion",
    },
  ].filter((f): f is ReelFact => Boolean(f));
}
