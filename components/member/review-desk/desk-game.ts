import { trackChips } from "@/components/issue/game-track";
import type { Game } from "@/lib/api/types";

// What the review desk shows of the game being reviewed: its art over the
// sheet, its name, and the pill beside the name.
export type ReviewDeskGame = Pick<
  Game,
  "title" | "art_url" | "cover_url" | "initial_release_date"
> &
  Partial<
    Pick<
      Game,
      "gotm_won" | "nr_gotm_won" | "gotm_month_year" | "nr_gotm_month_year" | "platforms"
    >
  >;

export interface DeskPill {
  tone: "gotm" | "nr" | "neutral";
  label: string;
}

// A winner wears its track's chip ("GOTM · November 2026"). Any other game has
// no track to claim, so its pill is the plain facts: the year and up to three
// platforms ("2025 · PC · Switch").
export function deskPill(game: ReviewDeskGame): DeskPill | null {
  const track = trackChips({
    gotm_won: game.gotm_won,
    nr_gotm_won: game.nr_gotm_won,
    gotm_month_year: game.gotm_month_year,
    nr_gotm_month_year: game.nr_gotm_month_year,
  }, { short: true })[0];
  if (track) return track;

  const facts = [
    game.initial_release_date
      ? String(new Date(game.initial_release_date).getUTCFullYear())
      : null,
    ...(game.platforms ?? [])
      .slice(0, 3)
      .map((p) => p.platform_abbreviation ?? p.platform_code ?? p.platform_name),
  ].filter(Boolean);
  return facts.length > 0 ? { tone: "neutral", label: facts.join(" · ") } : null;
}
