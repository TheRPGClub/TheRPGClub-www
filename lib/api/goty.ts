import { apiFetch } from "@/lib/api";
import type { GameSummary, UserSummary } from "./types";

// The yearly GOTY Vote (spec api#471) as the API serves it, and the server
// reads the admin desk makes. Each read swallows its failure and returns the
// empty value, as lib/api/voting-round.ts does, so an outage (or the
// goty_vote Feature switched Off) degrades the page rather than breaking it.

export type GotyAwardKey = "gotm" | "nr_gotm" | "game_of_the_year";

export const GOTY_AWARDS: readonly GotyAwardKey[] = ["gotm", "nr_gotm", "game_of_the_year"];

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
}

export interface GotyAwardTally {
  counts_hidden: boolean;
  runoff_counts_hidden: boolean;
  games?: { gamedb_game_id: number; votes: number; runoff_votes: number }[];
}

export interface GotyAward {
  award: GotyAwardKey;
  name: string;
  // The candidates once voting opened, else the live ballot.
  ballot: GameSummary[];
  cap: number;
  runoff_ballot: number[];
  // Tied games still awaiting the runoff or an admin.
  pending_tie: number[];
  own_votes: number[];
  own_runoff_votes: number[];
  tally: GotyAwardTally;
  winner?: { gamedb_game_id: number; decided_by: GotyDecidedBy; game?: GameSummary | null } | null;
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

async function read<T>(path: string, empty: T): Promise<T> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return empty;
    return ((await res.json()) as { data: T }).data;
  } catch {
    return empty;
  }
}

// Every year's GOTY Vote, newest first.
export function fetchGotyVotes(): Promise<GotyVoteSummary[]> {
  return read<GotyVoteSummary[]>("/api/v1/goty_votes?per=100", []);
}

export function fetchGotyVote(year: number): Promise<GotyVote | null> {
  return read<GotyVote | null>(`/api/v1/goty_votes/${year}`, null);
}

// The year's Game of the Year nominations, oldest first.
export function fetchGotyNominations(year: number): Promise<GotyNomination[]> {
  return read<GotyNomination[]>(`/api/v1/goty_votes/${year}/nominations?per=500`, []);
}
