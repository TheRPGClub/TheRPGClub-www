// Game Lists as the API sends them (spec api#442, api#446): a named list of
// GameDB games kept by a member, or by the club when `club` is true.
// Client-safe: types and labels only.

export type GameListSort = "ranked" | "alphabetical" | "added";
export type GameListVisibility = "members" | "private";

export const GAME_LIST_SORTS: readonly GameListSort[] = ["ranked", "alphabetical", "added"];

// The order's name, as the sort switch and the bylines say it.
export const SORT_LABEL: Record<GameListSort, string> = {
  ranked: "Ranked",
  alphabetical: "A to Z",
  added: "Date added",
};

export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 500;
export const NOTE_MAX = 280;
export const ENTRIES_MAX = 500;

export interface GameListMember {
  user_id: string;
  username: string;
  global_name?: string | null;
  discord_avatar?: string | null;
  avatar_url: string;
}

export interface GameListGame {
  game_id: number;
  title: string;
  cover_url?: string | null;
}

export interface GameListEntry {
  game_id: number;
  // Its place in the ranked order, from 1, whatever the list's sort.
  position: number;
  note: string | null;
  added_at: string;
  game: GameListGame & { initial_release_date?: string | null };
}

export interface GameList {
  id: number;
  name: string;
  description: string | null;
  visibility: GameListVisibility;
  sort: GameListSort;
  club: boolean;
  owner: GameListMember | null;
  taken_over_from: GameListMember | null;
  taken_over_at: string | null;
  entry_count: number;
  // Its first (up to 4) games in its own sort's order.
  preview_games: GameListGame[];
  viewer: { can_edit: boolean; can_delete: boolean };
  // The Pool Challenge the list feeds (null when none, or hidden). A list
  // feeds one Challenge at most, so no other can start from it.
  challenge?: { id: number; name: string } | null;
  // A single list only: every game, in its sort's order.
  entries?: GameListEntry[];
  created_at: string;
  updated_at: string;
}

// The name a member goes by on a list's byline.
export function memberName(member: GameListMember | null | undefined): string {
  if (!member) return "The club";
  return member.global_name || member.username;
}

// The 409 a delete, or a change to Private, gets while the list feeds a
// Challenge (api#448): confirming hands the list (or a copy) to the club.
export interface ListFeedsChallenges {
  message: string;
  challenges: { id: number; name: string }[];
}
