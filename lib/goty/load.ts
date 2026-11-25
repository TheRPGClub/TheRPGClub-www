import {
  GOTY_CURRENT_PATH,
  fetchGotyNominations,
  fetchGotyVote,
  fetchGotyVotes,
  readGoty,
} from "@/lib/api/goty";
import type { GotyNomination, GotyVote, GotyVoteSummary } from "./types";

// Everything /goty reads, in parallel where it can be: the Current GOTY
// Vote in full (api#482: the API owns which one that is: running, else
// tied or closed, else decided within the last 30 days, else upcoming), the
// year list, the current vote's Game of the Year nominations, next year's
// Year So Far while the current one is decided, and each other decided
// year in full for its final tallies (the list carries only the winners;
// api#476).

export interface GotyPageData {
  // The Current GOTY Vote: the one the page is about. Null when none exists
  // or the read failed (`unreachable`).
  current: GotyVote | null;
  // The current read failed (not a 404): the page says the server is down
  // rather than that there is no GOTY Vote.
  unreachable: boolean;
  nominations: GotyNomination[];
  // While the current vote is decided (its results stay up for 30 days):
  // next year's upcoming vote, for its Year So Far under the results.
  next: GotyVote | null;
  // Decided years but the current one, newest first, each in full.
  history: GotyVote[];
  now: number;
}

const HISTORY_LIMIT = 12;

export async function loadGotyPage(): Promise<GotyPageData> {
  const [read, list] = await Promise.all([readGoty<GotyVote | null>(GOTY_CURRENT_PATH, null), fetchGotyVotes()]);
  const now = Date.now();
  const current = read.ok ? read.data : null;
  const decided = [...list]
    .sort((a, b) => b.year - a.year)
    .filter((v: GotyVoteSummary) => v.phase === "decided" && v.year !== current?.year)
    .slice(0, HISTORY_LIMIT);
  const nextYear =
    current?.phase === "decided" && list.some((v) => v.year === current.year + 1 && v.phase === "upcoming")
      ? current.year + 1
      : null;
  const takesNominations = current && current.phase !== "upcoming" && current.phase !== "decided";
  const [nominations, next, ...past] = await Promise.all([
    takesNominations ? fetchGotyNominations(current.year) : Promise.resolve([]),
    nextYear ? fetchGotyVote(nextYear) : Promise.resolve(null),
    ...decided.map((v) => fetchGotyVote(v.year)),
  ]);
  return {
    current,
    unreachable: !read.ok,
    nominations: nominations as GotyNomination[],
    next: next && !Array.isArray(next) && next.phase === "upcoming" ? next : null,
    history: (past.filter(Boolean) as GotyVote[]).sort((a, b) => b.year - a.year),
    now,
  };
}
