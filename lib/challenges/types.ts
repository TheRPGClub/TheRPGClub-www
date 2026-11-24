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

// A game of the Pool as the Challenge serves it (swagger
// `ChallengePostGame`).
export interface ChallengePoolGame {
  game_id: number;
  title: string;
  cover_url?: string | null;
}

// Where an Optional Game comes from: picked by hand, else its first source.
export type OptionalSource = "hand" | "list" | "franchise" | "series";

export interface ChallengeOptionalGame extends ChallengePoolGame {
  source: OptionalSource;
  // Joined the Pool in the last 14 days, after the Challenge was created.
  new: boolean;
}

// A Pool Challenge's settings (spec api#442, ADR 0014): a Run Finishes by
// Clearing every Core Game plus `optional_target` Optional Games. Optional
// Games are the sources' games (a linked Game List, Franchises and Series,
// which the API calls collections) less Add-ons, plus those picked by hand,
// less the excluded and Core games. `optional_games`, `optional_count` and
// `game_count` are on the show only (null in lists).
export interface ChallengePool {
  optional_target: number;
  game_list?: { id: number; name: string; visible: boolean; can_add: boolean } | null;
  franchises?: { franchise_id: number; name: string }[];
  collections?: { collection_id: number; name: string }[];
  core_games?: ChallengePoolGame[];
  optional_games?: ChallengeOptionalGame[] | null;
  excluded_games?: { game_id: number; title: string }[];
  core_count?: number;
  optional_count?: number | null;
  game_count?: number | null;
}

// A list notice: a Core Game whose entry left the linked Game List, for the
// Host and Moderators to Remove or Keep (www#172 shows them).
export interface ChallengeListNotice {
  id: number;
  game?: ChallengePoolGame;
  created_at: string;
}

// A Pool Proposal (api#447): a member asked for a game to join a Pool
// Challenge, with an optional note to whoever decides.
export type PoolProposalStatus = "pending" | "accepted" | "declined";

export interface ChallengePoolProposal {
  id: number;
  challenge_id: number;
  game?: ChallengePoolGame;
  proposer?: ChallengeMember | null;
  note?: string | null;
  status: PoolProposalStatus;
  accepted_as?: "core" | "optional" | null;
  decider?: ChallengeMember | null;
  decided_at?: string | null;
  created_at: string;
  updated_at: string;
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
  // A Pool Challenge's pending Pool Proposals and open list notices, for
  // the Host and Moderators and above (null for other viewers and in lists).
  pending_proposals?: number | null;
  list_notices?: ChallengeListNotice[] | null;
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
    // Pool only: Core Games Cleared of how many (all are needed), and
    // Optional Games Cleared (every one counted) of how many are needed.
    core?: { cleared: number; total: number };
    optional?: { cleared: number; target: number };
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

// A Pool game with who played it (`GET /challenges/:id/pool_progress`,
// swagger `ChallengePoolGameProgress`): the Runs of the Season shown (or of
// every Run while Always Open), each member once per list.
export interface PoolProgressGame {
  game_id: number;
  title: string;
  initial_release_date?: string | null;
  cover_url?: string | null;
  // Earliest Clear first; a member here isn't also In Progress for it.
  cleared_by: (ChallengeMember & { run_id: number; cleared_on?: string | null })[];
  in_progress: (ChallengeMember & { run_id: number })[];
}

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
