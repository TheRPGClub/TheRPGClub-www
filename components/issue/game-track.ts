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
  return "text-paper";
}

// "Game of the Month · November 2026" chips, one per track the game won.
export function trackChips(
  game: Pick<Game, "gotm_won" | "nr_gotm_won" | "gotm_month_year" | "nr_gotm_month_year">,
  { short = false }: { short?: boolean } = {},
): { tone: GameTrack; label: string }[] {
  const chips: { tone: GameTrack; label: string }[] = [];
  if (game.gotm_won) {
    const name = short ? "GOTM" : "Game of the Month";
    chips.push({
      tone: "gotm",
      label: game.gotm_month_year ? `${name} · ${game.gotm_month_year}` : name,
    });
  }
  if (game.nr_gotm_won) {
    const name = short ? "NR-GOTM" : "Non-RPG Game of the Month";
    chips.push({
      tone: "nr_gotm",
      label: game.nr_gotm_month_year
        ? `${name} · ${game.nr_gotm_month_year}`
        : name,
    });
  }
  return chips;
}
