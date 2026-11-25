import type { GotyAwardWon } from "@/lib/api/types";

// The game page's winner marks (design www#191, option B "Rosettes"): the
// track's starburst, with ribbon tails when the game also holds that track's
// GOTY Vote Award, and a paper burst with tails for each Game of the Year.
// Any other Award (a second track, another year) gets its own rosette.

export type RosetteBurst = "gotm" | "nr_gotm" | "goty";

export interface Rosette {
  burst: RosetteBurst;
  // The Award the tails carry; null for a plain monthly burst.
  award: { year: number; name: string; tail: string } | null;
}

export const GOTY_AWARD_NAMES: Record<GotyAwardWon["award"], string> = {
  gotm: "GOTM of the Year",
  nr_gotm: "NR-GOTM of the Year",
  game_of_the_year: "Game of the Year",
};

function awardOf(won: GotyAwardWon): NonNullable<Rosette["award"]> {
  const name = GOTY_AWARD_NAMES[won.award];
  // The paper burst already reads "Game of the Year", so its tails carry the
  // year alone; a track burst reads "Game of the Month", so its tails name
  // the Award.
  return { year: won.year, name, tail: won.award === "game_of_the_year" ? "" : name };
}

export function gotyRosettes(
  track: "gotm" | "nr_gotm" | null,
  awards: readonly GotyAwardWon[] | null | undefined,
): Rosette[] {
  const won = awards ?? [];
  const merged = track ? won.find((a) => a.award === track) : undefined;
  const rosettes: Rosette[] = [];
  if (track) rosettes.push({ burst: track, award: merged ? awardOf(merged) : null });
  for (const a of won) {
    if (a === merged || a.award === "game_of_the_year") continue;
    rosettes.push({ burst: a.award, award: awardOf(a) });
  }
  for (const a of won) {
    if (a.award === "game_of_the_year") rosettes.push({ burst: "goty", award: awardOf(a) });
  }
  return rosettes;
}
