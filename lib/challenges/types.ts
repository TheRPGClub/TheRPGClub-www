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
  // The Discord avatar hash from their last website login (null if unknown),
  // and the API path of the picture the bot stores (it may 404).
  discord_avatar?: string | null;
  avatar_url?: string | null;
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
  // Every Run whatever its status (null in lists from an older API).
  run_count?: number | null;
  // Its Finished Runs in any Season, and up to 4 Pool games for a flyer
  // (absent from an older API, when the index reads them per Challenge).
  finished_count?: number | null;
  pool_games?: { game_id: number; title: string; cover_url?: string | null }[] | null;
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
  // The member placed it themselves (a slot move or a past-play pick).
  picked_by_hand: boolean;
  // Slots: the year it fills (null while In Progress or waiting for an open
  // year), and every year the game was released in (null for other Formats).
  slot_year?: number | null;
  release_years?: number[] | null;
  completion_id?: number | null;
  // The game's cover; a Run from an older API without it takes covers from
  // the Pool preview.
  cover_url?: string | null;
}

export interface ChallengeRun {
  id: number;
  challenge: {
    id: number;
    name: string;
    challenge_format: ChallengeFormat;
    schedule: ChallengeSchedule;
    // The Challenge's tint (absent from an older API: the curated one then).
    tint?: ChallengeTint | null;
    // Slots only (false / null otherwise, absent from an older API).
    counts_past_play?: boolean;
    slots?: ChallengeSlots | null;
  };
  user: ChallengeMember;
  status: RunStatus;
  started_at: string;
  ended_at?: string | null;
  // Assignment only: the Edition the Run was drawn in, and the game picked
  // for the member (null before the reveal).
  edition?: { id: number; year: number } | null;
  assignment?: { game?: GameSummary | null } | null;
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

// A member's Secret Santa sign-up whose Edition is still in sign-up (no Run
// until the draw), from `meta.signups` on their Runs list.
export interface ChallengeOpenSignup {
  edition_id: number;
  year: number;
  phase: "signup";
  challenge: { id: number; name: string };
  signed_up_at: string;
  // The draw day: sign-up closes as it starts.
  signup_cutoff_on: string;
  pick_deadline_on: string;
  reveal_on: string;
}

// An Edition (one yearly cycle of an Assignment Challenge) as
// `GET /api/v1/challenge_editions/:id` and the Challenge's Editions list
// serve it (swagger `ChallengeEdition`, tickets api#383 and api#384).
export type EditionPhase = ChallengeEditionSummary["phase"];

export interface EditionMember extends ChallengeMember {
  // The draw left them out: fewer than 5 games in their backlog by then.
  left_out: boolean;
  // They withdrew after the draw; their recipient gets a random pick.
  withdrawn: boolean;
  // While Santas pick: a game is picked for them (never who picked or what).
  // Null in other phases, for members left out, and from an older API.
  picked?: boolean | null;
}

export interface EditionAssignment {
  recipient: ChallengeMember;
  // The game picked (null while nothing is).
  game?: GameSummary | null;
  // Null while hidden with the game (a staff participant before the reveal).
  picked_randomly: boolean | null;
  // Null before the Edition ends, except to staff who aren't drawn in it.
  santa?: ChallengeMember | null;
  run?: {
    id: number;
    status: RunStatus;
    progress: { in_progress?: number; cleared?: number; target?: number };
  } | null;
}

export interface ChallengeEdition extends ChallengeEditionSummary {
  challenge: { id: number; name: string };
  // Members may sign up and withdraw today.
  signup_open: boolean;
  signed_up_count: number;
  // The member reading is signed up (withdrawn after the draw included).
  signed_up: boolean;
  // Everyone who signed up, first first.
  members?: EditionMember[];
  drawn_at?: string | null;
  // Every assignment by recipient, from the reveal on (and to staff from the
  // draw on); null otherwise.
  assignments?: EditionAssignment[] | null;
  picks_closed_at?: string | null;
  // While Santas pick: how many members have a game picked for them.
  picked_count?: number | null;
  // The member reading: their backlog size and whether it meets the
  // minimum to sign up (null without a member; absent from an older API).
  viewer?: { backlog_count: number; eligible: boolean } | null;
}

// The signed-in Santa's side of an Edition (`GET .../santa`, swagger
// `ChallengeSanta`): who they pick for, hints about what that member likes,
// what they picked, and the recipient's eligible backlog (their backlog
// without the games they've Cleared). The Edition page reads only the first
// few fields, so the rest are optional.
export interface SantaView {
  edition_id: number;
  year?: number;
  challenge?: { id: number; name: string };
  reveal_on?: string;
  recipient: ChallengeMember;
  taste?: SantaTaste;
  pick?: { game: GameSummary; picked_at?: string; picked_randomly: boolean } | null;
  pick_deadline_on?: string;
  picks_open?: boolean;
  backlog?: SantaBacklogEntry[];
}

// Top 3 genres and the platform the recipient plays most on.
export interface SantaTaste {
  genres: { genre_id: number; name: string }[];
  platform: { platform_id: number; platform_name: string; platform_abbreviation?: string | null } | null;
}

// One entry of the recipient's eligible backlog, with HowLongToBeat's time
// (`hours`, the one backlog#pick compares; null without).
export interface SantaBacklogEntry {
  entry_id: number;
  gamedb_game_id: number;
  platform_id?: number | null;
  note?: string | null;
  game: GameSummary;
  platform?: { platform_id: number; platform_name: string; platform_abbreviation?: string | null } | null;
  hours?: number | null;
}
