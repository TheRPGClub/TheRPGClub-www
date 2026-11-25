import { fetchGotyCurrent, fetchGotyNominations, fetchGotyVote, fetchGotyVotes } from "@/lib/api/goty";
import type { GotyNomination, GotyVote, GotyVoteSummary } from "./types";

// Everything /goty reads, in parallel where it can be: the Current GOTY
// Vote in full (api#482: the API owns which one that is, so in January the
// vote that is running wins over next year's upcoming one), the year list,
// the current vote's Game of the Year nominations, and each decided year in
// full for its final tallies (the list carries only the winners; api#476).

export interface GotyPageData {
  // The Current GOTY Vote: the one the page is about. Null when none exists.
  current: GotyVote | null;
  nominations: GotyNomination[];
  // Decided years, newest first, each in full for its tally.
  history: GotyVote[];
  now: number;
}

const HISTORY_LIMIT = 12;

export async function loadGotyPage(): Promise<GotyPageData> {
  const [current, list] = await Promise.all([fetchGotyCurrent(), fetchGotyVotes()]);
  const now = Date.now();
  const decided = [...list]
    .sort((a, b) => b.year - a.year)
    .filter((v: GotyVoteSummary) => v.phase === "decided" && v.year !== current?.year)
    .slice(0, HISTORY_LIMIT);
  const [nominations, ...past] = await Promise.all([
    current && current.phase !== "upcoming" ? fetchGotyNominations(current.year) : Promise.resolve([]),
    ...decided.map((v) => fetchGotyVote(v.year)),
  ]);
  const history = [
    ...(current && current.phase === "decided" ? [current] : []),
    ...(past.filter(Boolean) as GotyVote[]),
  ].sort((a, b) => b.year - a.year);
  return { current, nominations: nominations as GotyNomination[], history, now };
}
