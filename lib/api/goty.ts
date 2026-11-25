import { apiFetch } from "@/lib/api";
import type { GameSummary, UserSummary } from "./types";

// The yearly GOTY Vote (spec api#471) as the API serves it, and the server
// reads the admin desk makes. Each read swallows its failure and returns the
// empty value, as lib/api/voting-round.ts does, so an outage (or the
// goty_vote Feature switched Off) degrades the page rather than breaking it.

export type GotyAwardKey = "gotm" | "nr_gotm" | "game_of_the_year";

export const GOTY_AWARDS: readonly GotyAwardKey[] = ["gotm", "nr_gotm", "game_of_the_year"];

// One Award a game won: GET /api/v1/games/:id `goty_awards` (the game page's
// badge), newest year first.
export interface GotyAwardWon {
  year: number;
  award: GotyAwardKey;
}

// Derived by the API at read time; `closed` is the gap between a window
// closing and the sweep's tally.
export type GotyPhase = "upcoming" | "nominating" | "voting" | "closed" | "runoff" | "tie" | "decided";

export type GotyDecidedBy = "vote" | "runoff" | "admin" | "uncontested";

// GET /api/v1/goty_votes items.
export interface GotyVoteSummary {
  year: number;
  // "GOTY Vote 2026".
  name: string;
  nominations_open_at: string;
  voting_opens_at: string;
  voting_closes_at: string;
  closed_at?: string | null;
  runoff_opens_at?: string | null;
  runoff_closes_at?: string | null;
  runoff_closed_at?: string | null;
  decided_at?: string | null;
  phase: GotyPhase;
  nominations_open: boolean;
  voting_open: boolean;
  runoff_open: boolean;
  // Each Award's winner once the year is decided; empty before (api#476).
  winners?: GotyVoteWinner[];
}

export interface GotyAwardWinner {
  gamedb_game_id: number;
  decided_by: GotyDecidedBy;
  game?: GameSummary | null;
}

export interface GotyVoteWinner extends GotyAwardWinner {
  award: GotyAwardKey;
  name: string;
}

// An Award's full result once the year is decided: every candidate with its
// votes and voters.
export interface GotyAwardResult {
  gamedb_game_id: number;
  votes: number;
  runoff_votes: number;
  voters?: UserSummary[];
  runoff_voters?: UserSummary[];
}

export interface GotyAwardTally {
  counts_hidden: boolean;
  runoff_counts_hidden: boolean;
  games?: { gamedb_game_id: number; votes: number; runoff_votes: number }[];
}

// Where a GOTM / NR-GOTM of the Year candidate won: one per round, in round
// order. `month_year` is the round's raw label ("January 2026", or a legacy
// "Jan 2026" / "2026-01"), so the site formats it (api#479).
export interface GotyWonIn {
  round_number: number;
  month_year: string;
}

// A ballot game. GOTM / NR-GOTM of the Year candidates carry `won_in`; Game
// of the Year candidates have no such key.
export interface GotyBallotGame extends GameSummary {
  won_in?: GotyWonIn[];
}

export interface GotyAward {
  award: GotyAwardKey;
  name: string;
  // The candidates once voting opened, else the live ballot.
  ballot: GotyBallotGame[];
  cap: number;
  runoff_ballot: number[];
  // Tied games still awaiting the runoff or an admin.
  pending_tie: number[];
  own_votes: number[];
  own_runoff_votes: number[];
  tally: GotyAwardTally;
  result?: GotyAwardResult[] | null;
  winner?: GotyAwardWinner | null;
}

// GET /api/v1/goty_votes/:year.
export interface GotyVote extends GotyVoteSummary {
  candidates_frozen_at?: string | null;
  pending_ties: Partial<Record<GotyAwardKey, number[]>>;
  runoff_ties: Partial<Record<GotyAwardKey, number[]>>;
  awards: GotyAward[];
}

// A Game of the Year nomination (no reason: owner decision, api#473).
export interface GotyNomination {
  id: number;
  year: number;
  user_id: string;
  gamedb_game_id: number;
  nominated_at: string;
  user?: UserSummary | null;
  game?: GameSummary | null;
}

// DELETE /api/v1/goty_votes/:year/nominations/:id.
export interface GotyNominationDeletedResponse {
  deleted: boolean;
  meta?: { announce_job_id: number | null };
}

// GET /api/v1/games/:id/goty_eligibility?year=.
export interface GotyEligibility {
  game_id: number;
  year: number;
  eligible: boolean;
  reason?: "not_released_in_year" | "release_unknown" | null;
  released_on?: string | null;
  date_precision?: "day" | "month" | "quarter" | "year" | "tba" | null;
  source?: "release" | "initial_release_date" | null;
}

// POST /api/v1/goty_votes/:year/votes.
export interface GotyCastResult {
  action: "voted" | "unvoted";
  vote?: { gamedb_game_id: number; game?: GameSummary | null } | null;
  removed_votes: { gamedb_game_id: number; game?: GameSummary | null }[];
  cap: number;
  runoff: boolean;
  warning?: string | null;
}

async function read<T>(path: string, empty: T): Promise<T> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return empty;
    return ((await res.json()) as { data: T }).data;
  } catch {
    return empty;
  }
}

// A read that tells "nothing there" from "couldn't ask": a 404 (no such
// year, or the goty_vote Feature Off for this caller) is the empty value,
// while any other refusal or an unreachable API is a failure, so a desk can
// say the server is down rather than that there is nothing to run.
export type GotyRead<T> = { ok: true; data: T } | { ok: false };

export async function readGoty<T>(path: string, empty: T): Promise<GotyRead<T>> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (res.status === 404) return { ok: true, data: empty };
    if (!res.ok) return { ok: false };
    return { ok: true, data: ((await res.json()) as { data: T }).data };
  } catch {
    return { ok: false };
  }
}

export const GOTY_VOTES_PATH = "/api/v1/goty_votes?per=100";
export const gotyVotePath = (year: number) => `/api/v1/goty_votes/${year}`;
export const gotyNominationsPath = (year: number) => `/api/v1/goty_votes/${year}/nominations?per=500`;

// Every year's GOTY Vote, newest first.
export function fetchGotyVotes(): Promise<GotyVoteSummary[]> {
  return read<GotyVoteSummary[]>(GOTY_VOTES_PATH, []);
}

export function fetchGotyVote(year: number): Promise<GotyVote | null> {
  return read<GotyVote | null>(gotyVotePath(year), null);
}

// The year's Game of the Year nominations, oldest first.
export function fetchGotyNominations(year: number): Promise<GotyNomination[]> {
  return read<GotyNomination[]>(gotyNominationsPath(year), []);
}
