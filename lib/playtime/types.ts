// The member's Playtime for one game as the API returns it (spec api#457):
// GET /users/:user_id/games/:game_id/playtime, and every Playtime write
// (Manual Playtime, mismatches, Playthroughs) answers with the same document.

export type PlaytimeProvider = "steam" | "retroachievements" | "psn";

// A Provider's figure for one Achievement Set mapped to the game.
export interface PlaytimeProviderSet {
  achievement_set_id: number;
  provider: PlaytimeProvider;
  title?: string | null;
  // The Provider's own label ("PC", "SNES"), raw.
  platform_label?: string | null;
  // The GameDB platform it resolves to; null when it doesn't.
  platform_id?: number | null;
  platform_name?: string | null;
  minutes: number;
  // False when the member kept their Manual entry on this platform over
  // this Provider ("Keep mine"): shown, not counted.
  counted: boolean;
}

// One Manual Playtime entry: one per member, game and platform (null is
// "Other").
export interface ManualPlaytimeEntry {
  id: number;
  platform_id?: number | null;
  platform_name?: string | null;
  minutes: number;
  note?: string | null;
  origin: "member" | "completion_seed";
  keeps_over_provider?: PlaytimeProvider | null;
  // The Provider whose figure on this platform counts alongside this entry,
  // no longer a mismatch ("Keep both").
  mismatch_acknowledged_provider?: PlaytimeProvider | null;
  created_at: string;
  updated_at: string;
}

// A Manual entry and a Provider on the same resolved platform, with no keep
// chosen yet (mine, the Provider's or both).
export interface PlaytimeMismatch {
  platform_id: number;
  platform_name?: string | null;
  provider: PlaytimeProvider;
  provider_minutes: number;
  manual_playtime_id: number;
  manual_minutes: number;
}

export interface OpenPlaythrough {
  id: number;
  started_at: string;
  // The total set by hand when `manual`, else the Playtime gained since it
  // started.
  minutes: number;
  // The member's Playtime when it started: its measured time is Playtime
  // now minus this, floored at 0.
  baseline_minutes?: number;
  manual: boolean;
}

export interface EndedPlaythrough {
  id: number;
  started_at: string;
  ended_at: string;
  end_reason: "completed" | "abandoned";
  minutes: number;
  manual: boolean;
  completion_id?: number | null;
}

export interface GamePlaytime {
  user_id: string;
  game_id: number;
  total_minutes: number;
  breakdown: {
    provider_sets: PlaytimeProviderSet[];
    manual_entries: ManualPlaytimeEntry[];
  };
  mismatches: PlaytimeMismatch[];
  playthrough: OpenPlaythrough | null;
  // Ended ones, newest first.
  playthroughs: EndedPlaythrough[];
}

export type ManualPlaytimeMode = "add" | "set";
// Keep mine, keep the Provider's, or keep both (both count, no longer
// flagged).
export type MismatchKeep = "manual" | "provider" | "both";
