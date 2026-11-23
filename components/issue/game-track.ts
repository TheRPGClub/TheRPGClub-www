import type { Game } from "@/lib/api/types";

// Which of the club's two tracks a game won, if any. A game that won both
// reads as GOTM first: it's the cover story.
export type GameTrack = "gotm" | "nr_gotm";

export function gameTrack(
  game: Pick<Game, "gotm_won" | "nr_gotm_won"> | null | undefined,
): GameTrack | null {
  if (game?.gotm_won) return "gotm";
  if (game?.nr_gotm_won) return "nr_gotm";
  return null;
}

// The headline's second line: yellow on a GOTM winner (as on the dashboard's
// cover), violet on an NR-GOTM one, plain paper otherwise.
export function trackAccentText(track: GameTrack | null): string {
  if (track === "gotm") return "text-highlight";
  if (track === "nr_gotm") return "text-nr-soft";
  return "text-foreground";
}

// "Game of the Month · November 2026" chips, one per track the game won; the
// tone is the track's Badge tone.
export function trackChips(
  game: Pick<Game, "gotm_won" | "nr_gotm_won" | "gotm_month_year" | "nr_gotm_month_year">,
  { short = false, shortMonth = false }: { short?: boolean; shortMonth?: boolean } = {},
): { tone: "gotm" | "nr"; label: string }[] {
  const chips: { tone: "gotm" | "nr"; label: string }[] = [];
  const label = (name: string, month: string | null | undefined) =>
    month ? `${name} · ${shortMonth ? shortMonthYear(month) : month}` : name;
  if (game.gotm_won) {
    chips.push({ tone: "gotm", label: label(short ? "GOTM" : "Game of the Month", game.gotm_month_year) });
  }
  if (game.nr_gotm_won) {
    chips.push({ tone: "nr", label: label(short ? "NR-GOTM" : "Non-RPG Game of the Month", game.nr_gotm_month_year) });
  }
  return chips;
}

// "November 2024" as "Nov 2024", for a pill; anything else as it is.
function shortMonthYear(monthYear: string): string {
  const match = /^([A-Za-z]{3})[A-Za-z]* (\d{4})$/.exec(monthYear.trim());
  return match ? `${match[1]} ${match[2]}` : monthYear;
}
