// A Franchise as the API sends it (spec api#442, PR api#449). Client-safe.
import type { UserSummary } from "@/lib/api/types";

export interface FranchiseColumns {
  franchise_id: number;
  name: string;
  igdb_franchise_id: number | null;
  // Who made it by hand; null for IGDB's.
  created_by: string | null;
  name_locked: boolean;
  // A merged Franchise points at the one it went into and refuses changes.
  merged_into_id: number | null;
}

export type FranchiseLinkSource = "igdb" | "manual";

// A game on a Franchise's page.
export interface FranchiseGame {
  game_id: number;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  mainline: boolean;
  source: FranchiseLinkSource;
  parent_game_name: string | null;
}

export interface FranchiseAddOnParent {
  game_id: number;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  in_franchise: boolean;
}

// Add-ons under their parent game; the last group has a null parent (the
// parent isn't in GameDB).
export interface FranchiseAddOnGroup {
  parent: FranchiseAddOnParent | null;
  games: FranchiseGame[];
}

export interface FranchisePage extends FranchiseColumns {
  games: {
    mainline: FranchiseGame[];
    other: FranchiseGame[];
    add_ons: FranchiseAddOnGroup[];
  };
  viewer: { can_edit: boolean; can_admin: boolean };
}

export type FranchiseChangeAction =
  | "link"
  | "unlink"
  | "mainline_on"
  | "mainline_off"
  | "create"
  | "rename"
  | "merge"
  | "delete";

// A row of a Franchise's history. `before` / `after` differ by action.
export interface FranchiseChange {
  change_id: number;
  franchise_id: number;
  game_id: number | null;
  game_title: string | null;
  action: FranchiseChangeAction;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  user_id: string | null;
  username: string | null;
  created_at: string;
  undone_at: string | null;
  undone_by: string | null;
  undone_by_username: string | null;
  can_undo: boolean;
}

// A Franchise on a game (its relations), with whether the game is Mainline
// in it.
export interface GameFranchiseRef {
  franchise_id: number;
  name: string;
  mainline: boolean;
}

// Franchise Progress (spec api#457, api#461), behind the `franchise_progress`
// Feature. A meter counts games done (any Game Completion, a game once) of
// `total`, with the member's Playtime on them; `total` 0 is an empty meter.
// Add-ons are in no meter. Spin-offs are the API's `other` games.
export interface FranchiseProgressMeter {
  done: number;
  total: number;
  playtime_minutes: number;
}

export interface FranchiseProgressMeters {
  mainline: FranchiseProgressMeter;
  // Mainline and spin-offs together.
  all: FranchiseProgressMeter;
  spin_offs: FranchiseProgressMeter;
}

export type CompletionType = "Completionist" | "Main Story + Side Content" | "Main Story";

export interface FranchiseProgressGame {
  game_id: number;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  done: boolean;
  // The most thorough of the member's Completions; null when not done.
  completion_type: CompletionType | null;
  playtime_minutes: number;
}

// GET /franchises/:id/progress?user_id=
export interface FranchiseProgress {
  user_id: string;
  franchise_id: number;
  conquered_at: string | null;
  meters: FranchiseProgressMeters;
  // Oldest release first, as the Franchise page orders them.
  games: { mainline: FranchiseProgressGame[]; spin_offs: FranchiseProgressGame[] };
}

// A row of GET /franchises/:id/progress/members, in the API's order:
// Conquered first (earliest first), then by Mainline (by `all` with no
// Mainline games), then by Playtime.
export interface FranchiseProgressMember {
  user: UserSummary;
  meters: FranchiseProgressMeters;
  conquered_at: string | null;
}

// What the Progress tab is given: the viewer's progress, the member pressed
// in the table (null for none, or when theirs couldn't be read) and the
// table. `preview` badges the tab for staff seeing a Preview Feature.
export interface FranchiseProgressView {
  yours: FranchiseProgress;
  theirs: FranchiseProgress | null;
  members: FranchiseProgressMember[];
  preview: boolean;
}
