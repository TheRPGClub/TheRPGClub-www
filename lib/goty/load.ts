import { fetchGotyNominations, fetchGotyVote, fetchGotyVotes } from "@/lib/api/goty";
import type { GotyNomination, GotyVote, GotyVoteSummary } from "./types";

// Everything /goty reads, in parallel where it can be: the year list, the
// current GOTY Vote in full, its Game of the Year nominations, and each
// decided year in full for its final tallies (the list carries only the
// winners; api#476).

export interface GotyPageData {
  // The newest GOTY Vote: the one the page is about. Null when none exists.
  current: GotyVote | null;
  nominations: GotyNomination[];
  // Decided years, newest first, each in full for its tally.
  history: GotyVote[];
  now: number;
}

const HISTORY_LIMIT = 12;

export async function loadGotyPage(): Promise<GotyPageData> {
  const list = [...(await fetchGotyVotes())].sort((a, b) => b.year - a.year);
  const now = Date.now();
  const [head] = list;
  const decided = list.filter((v: GotyVoteSummary) => v.phase === "decided").slice(0, HISTORY_LIMIT);
  const others = decided.filter((v) => v.year !== head?.year);
  const [current, nominations, ...past] = await Promise.all([
    head ? fetchGotyVote(head.year) : Promise.resolve(null),
    head && head.phase !== "upcoming" ? fetchGotyNominations(head.year) : Promise.resolve([]),
    ...others.map((v) => fetchGotyVote(v.year)),
  ]);
  const history = [
    ...(current && current.phase === "decided" ? [current] : []),
    ...(past.filter(Boolean) as GotyVote[]),
  ].sort((a, b) => b.year - a.year);
  return { current, nominations: nominations as GotyNomination[], history, now };
}
