import { ExternalLink } from "lucide-react";
import type { GotmRound, GotmRoundGame, VotingCategory } from "@/lib/api/types";
import type { GotmCardLink } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

// Pieces the GOTM history's two layouts (the ledger and the cover wall)
// share: track naming, round dates, year grouping and the outbound link row.

export const TRACK_LABEL: Record<VotingCategory, string> = {
  gotm: "GOTM",
  nr_gotm: "NR-GOTM",
};

export const UNKNOWN_GAME_TITLE = "Unknown game";

export function sortedWinners(games: GotmRoundGame[]): GotmRoundGame[] {
  return [...games].sort((a, b) => a.game_index - b.game_index);
}

export function roundMonthYear(round: GotmRound): string | null {
  return round.gotm?.month_year ?? round.nr_gotm?.month_year ?? null;
}

// "August 2026" -> { month: "Aug", year: 2026 }. The archive's month_year is
// free text from the bot, so anything unexpected comes back as-is.
export function splitMonthYear(monthYear: string | null): {
  month: string | null;
  year: number | null;
} {
  if (!monthYear) return { month: null, year: null };
  const match = /^\s*([A-Za-z]+)\s+(\d{4})\s*$/.exec(monthYear);
  if (!match) return { month: monthYear, year: null };
  return { month: match[1].slice(0, 3), year: Number(match[2]) };
}

// Consecutive rounds that share a year, in the order the page received
// them, so either sort direction groups correctly.
export function groupByYear(
  rounds: GotmRound[],
): { year: number | null; rounds: GotmRound[] }[] {
  const groups: { year: number | null; rounds: GotmRound[] }[] = [];
  for (const round of rounds) {
    const { year } = splitMonthYear(roundMonthYear(round));
    const last = groups.at(-1);
    if (last && last.year === year) last.rounds.push(round);
    else groups.push({ year, rounds: [round] });
  }
  return groups;
}

// Headlines break at the subtitle colon and the second line takes the
// track's accent, as on the dashboard's cover story.
export function splitTitle(title: string): [string, string] {
  const colon = title.indexOf(":");
  if (colon > 0 && colon < title.length - 1) {
    return [title.slice(0, colon + 1), title.slice(colon + 1).trim()];
  }
  const space = title.lastIndexOf(" ");
  if (space > 0) return [title.slice(0, space), title.slice(space + 1)];
  return ["", title];
}

// Reddit / Thread / Voting results, raised above a panel's whole-card link.
export function OutboundLinks({
  links,
  className,
}: {
  links: GotmCardLink[];
  className?: string;
}) {
  if (links.length === 0) return null;
  return (
    <ul className={cn("relative z-20 -ml-1 flex flex-wrap", className)}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label inline-flex items-center gap-1 px-1 py-0.5 text-[0.8rem] font-bold tracking-[0.06em] text-paper-dim transition-colors hover:text-highlight"
          >
            {link.label}
            <ExternalLink aria-hidden className="size-3.25" />
          </a>
        </li>
      ))}
    </ul>
  );
}
