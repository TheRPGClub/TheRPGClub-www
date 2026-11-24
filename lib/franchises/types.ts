// A Franchise as the API sends it (spec api#442, PR api#449). Client-safe.

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
