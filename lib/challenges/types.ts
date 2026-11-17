import type { GameSummary } from "@/lib/api/types";

// The Challenge JSON as the API serves it (spec api#376; swagger
// `Challenge`, `ChallengeRun`, `ChallengePoolSource`). Client-safe.

export type ChallengeFormat = "pool" | "slots" | "assignment";
export type ChallengeSchedule = "always_open" | "seasonal";
export type RunStatus = "active" | "finished" | "expired" | "abandoned";

export interface ChallengeMember {
  user_id: string;
  username: string;
  global_name?: string | null;
}

// A Challenge's colour as a pair (DESIGN.md "Challenges inks"): `fill` sits
// under paper type, `hi` is the same hue lifted for type and marks on ink.
export interface ChallengeTint {
  fill: string;
  hi: string;
}

export interface ChallengePool {
  target: number | "all";
  franchises?: { franchise_id: number; name: string }[];
  collections?: { collection_id: number; name: string }[];
  included_games?: { game_id: number; title: string }[];
  excluded_games?: { game_id: number; title: string }[];
  game_count?: number | null;
}

export interface ChallengeSlots {
  first_year: number | "birth_year";
  last_year: number | "current_year";
  counts_past_play: boolean;
}

export interface ChallengeEditionSummary {
  id: number;
  year: number;
  phase: "signup" | "picking" | "revealed" | "ended" | "cancelled";
  signup_opens_on: string;
  signup_cutoff_on: string;
  pick_deadline_on: string;
  reveal_on: string;
  ends_on: string;
}

export interface ChallengeAssignment {
  signup_cutoff: string;
  pick_deadline: string;
  reveal: string;
  edition?: ChallengeEditionSummary | null;
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  challenge_format: ChallengeFormat;
  hosted_by_club: boolean;
  host?: ChallengeMember | null;
  schedule: ChallengeSchedule;
  ends_on?: string | null;
  season?: { start: string; end: string; crosses_new_year: boolean } | null;
  open: boolean;
  pool?: ChallengePool | null;
  slots?: ChallengeSlots | null;
  assignment?: ChallengeAssignment | null;
  // Null in lists; every Run whatever its status on the show.
  run_count?: number | null;
  hidden: boolean;
  ended_at?: string | null;
  // Added by the API's tint change (www#106 follow-up): absent until it
  // lands, when the site falls back to the curated tints (lib/challenges/tint).
  tint?: ChallengeTint | null;
  key_art_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeRunEntry {
  game_id: number;
  title: string;
  state: "in_progress" | "cleared";
  cleared_on?: string | null;
  picked_by_hand: boolean;
}

export interface ChallengeRun {
  id: number;
  challenge: {
    id: number;
    name: string;
    challenge_format: ChallengeFormat;
    schedule: ChallengeSchedule;
  };
  user: ChallengeMember;
  status: RunStatus;
  started_at: string;
  ended_at?: string | null;
  window: { starts_on: string; ends_on?: string | null };
  progress: {
    in_progress: number;
    cleared: number;
    target: number;
    caught_up?: boolean;
  };
  entries?: ChallengeRunEntry[];
  slots?: {
    first_year: number;
    last_year: number;
    growing: boolean;
    years?: { year: number; game_id?: number | null; title?: string | null }[];
  } | null;
}

export interface PoolSource {
  kind: "franchise" | "collection";
  id: number;
  name: string;
  game_count: number;
}

export interface ChallengeWarning {
  code: "duplicate_name";
  message: string;
  challenge_ids?: number[];
}

export type PoolGame = GameSummary;
