import { apiFetch } from "@/lib/api";
import type {
  Nomination,
  NominationVote,
  VoteTallyRow,
  VotingCategory,
  VotingInfo,
} from "./types";

// Server-side reads for a voting round, shared by /voting and the ballot
// panel on a game page.
//
// Everything here is no-store: tallies move as other members vote, the
// responses embed the viewer's own votes, and the round's windows can flip
// between renders. Each read swallows its own failure and returns the empty
// value, so a voting outage degrades a page rather than breaking it.

export const VOTING_CATEGORY_PATH: Record<VotingCategory, string> = {
  gotm: "gotm_entries",
  nr_gotm: "nr_gotm_entries",
};

export const VOTING_CATEGORIES: readonly VotingCategory[] = [
  "gotm",
  "nr_gotm",
];

export const VOTING_CATEGORY_TITLE: Record<VotingCategory, string> = {
  gotm: "Game of the Month",
  nr_gotm: "Non-RPG Game of the Month",
};

export interface RoundTally {
  rows: VoteTallyRow[];
  // Per-user vote cap for the round (2, or 3 for fields of 9+ nominations).
  cap: number;
}

const DEFAULT_CAP = 2;

export async function fetchVotingInfo(): Promise<VotingInfo | null> {
  try {
    const res = await apiFetch("/api/v1/voting_info/current", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return ((await res.json()) as { data: VotingInfo }).data;
  } catch {
    return null;
  }
}

export async function fetchNominations(
  category: VotingCategory,
  round: number,
): Promise<Nomination[]> {
  try {
    const res = await apiFetch(
      `/api/v1/${VOTING_CATEGORY_PATH[category]}/${round}/nominations?limit=200`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    return ((await res.json()) as { data: Nomination[] }).data;
  } catch {
    return [];
  }
}

export async function fetchTally(
  category: VotingCategory,
  round: number,
): Promise<RoundTally> {
  try {
    const res = await apiFetch(
      `/api/v1/${VOTING_CATEGORY_PATH[category]}/${round}/votes/tally`,
      { cache: "no-store" },
    );
    if (!res.ok) return { rows: [], cap: DEFAULT_CAP };
    const body = (await res.json()) as {
      data: VoteTallyRow[];
      meta: { cap: number };
    };
    return { rows: body.data, cap: body.meta.cap };
  } catch {
    return { rows: [], cap: DEFAULT_CAP };
  }
}

export async function fetchUserVotes(
  category: VotingCategory,
  round: number,
  userId: string,
): Promise<NominationVote[]> {
  try {
    const res = await apiFetch(
      `/api/v1/${VOTING_CATEGORY_PATH[category]}/${round}/votes/${userId}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    return ((await res.json()) as { data: NominationVote[] }).data;
  } catch {
    return [];
  }
}

// A round's ballot is public once its vote opens, and stays readable
// afterwards as the results board. Before that the ballot is withheld, so
// nothing outside /voting should reveal what is on it.
export function ballotIsPublic(info: VotingInfo): boolean {
  return info.voting_open || info.voting_ended;
}

// The tally counts votes per nomination, but two members can nominate the
// same game in one round, and a member may only vote for a given game once
// (the backend toggles by game, not by nomination). A game's real support is
// therefore the sum of its nominations' counts.
export function tallyByGame(rows: VoteTallyRow[]): Map<number, number> {
  const byGame = new Map<number, number>();
  for (const row of rows) {
    if (row.gamedb_game_id === null) continue;
    byGame.set(
      row.gamedb_game_id,
      (byGame.get(row.gamedb_game_id) ?? 0) + row.vote_count,
    );
  }
  return byGame;
}

// Which action the round is currently accepting. The two windows are exact
// complements plus a finished state, so this is the whole lifecycle.
export type VotingPhase = "nominate" | "vote" | "closed";

export function votingPhase(info: VotingInfo): VotingPhase {
  if (info.voting_open) return "vote";
  if (info.voting_ended) return "closed";
  return "nominate";
}

const PHASE_REVALIDATE_SECONDS = 60;

// The phase alone, for the sidebar badge — which renders on every page in the
// app. This read is cached rather than no-store: the phase only turns at
// scheduled boundaries, so a badge that lags the turn by up to a minute costs
// nothing, where an uncached read would put an API round-trip on every page
// load. /voting keeps fetchVotingInfo's no-store read and stays exact.
//
// Sharing one cache entry between viewers is safe HERE because
// voting_info/current is global round metadata with nothing per-user in it.
// Next keys the Data Cache on URL, method and body — NOT on headers — so
// apiFetch's per-user bearer token does not separate entries. Never cache a
// per-user endpoint this way.
export async function fetchCurrentPhase(): Promise<VotingPhase | null> {
  try {
    const res = await apiFetch("/api/v1/voting_info/current", {
      next: { revalidate: PHASE_REVALIDATE_SECONDS, tags: ["voting-info"] },
    });
    if (!res.ok) return null;
    return votingPhase(((await res.json()) as { data: VotingInfo }).data);
  } catch {
    return null;
  }
}
