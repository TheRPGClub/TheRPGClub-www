import type { FranchiseColumns } from "@/lib/franchises/types";
import type { FranchiseRole } from "./franchises";

// Franchise suggestions for a game (www#209, from GET
// /api/v1/games/:id/franchise_suggestions, api#489): up to three Franchises
// it probably belongs to, each with why and a likely role. They show in the
// role lanes' + Add slots. Client-safe.

export type FranchiseSuggestionReason = "series_name" | "series_links" | "title_match";

export interface FranchiseSuggestion {
  franchise: FranchiseColumns;
  reason: FranchiseSuggestionReason;
  reasons: FranchiseSuggestionReason[];
  // The API's role key: `other` is a Spin-off.
  role: "mainline" | "other" | "add_on";
  // Set only for `add_on`: the game's parent, which is in that Franchise.
  parent_game_id?: number | null;
  parent_title?: string | null;
  series_games_linked: number;
}

const LANE: Record<FranchiseSuggestion["role"], FranchiseRole> = { mainline: "mainline", other: "spinoff", add_on: "addon" };

export function suggestionLane(s: FranchiseSuggestion): FranchiseRole {
  return LANE[s.role] ?? "spinoff";
}

// The strongest reason, in a few words (the sketch's "Series matches").
export function suggestionReason(s: FranchiseSuggestion): string {
  switch (s.reason) {
    case "series_name":
      return "Series matches";
    case "series_links":
      return s.series_games_linked === 1 ? "1 Series game linked" : `${s.series_games_linked} Series games linked`;
    default:
      return "Title matches";
  }
}

// Every reason as one sentence, for the row's title and screen readers.
export function suggestionWhy(s: FranchiseSuggestion): string {
  const parts = s.reasons.map((r) =>
    r === "series_name"
      ? "its Series has the same name"
      : r === "series_links"
        ? `${s.series_games_linked === 1 ? "1 game" : `${s.series_games_linked} games`} in its Series ${s.series_games_linked === 1 ? "is" : "are"} linked to it`
        : "the title has its name",
  );
  if (parts.length === 0) return "";
  const text = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return `Suggested because ${text}.`;
}

// The parent one press fills in Add-on of: the suggestion's, when it is an
// Add-on suggestion naming one.
export function suggestionParent(s: FranchiseSuggestion): { game_id: number; name: string } | undefined {
  if (s.role !== "add_on" || !s.parent_game_id) return undefined;
  return { game_id: s.parent_game_id, name: s.parent_title ?? "Its parent game" };
}

// The suggestions an open slot in `lane` lists: those not linked, staged or
// dismissed, the ones whose likely role is the lane's first (the API's
// order otherwise).
export function laneSuggestions(
  suggestions: FranchiseSuggestion[],
  lane: FranchiseRole,
  hidden: (franchiseId: number) => boolean,
): FranchiseSuggestion[] {
  const shown = suggestions.filter((s) => !hidden(s.franchise.franchise_id));
  return [...shown.filter((s) => suggestionLane(s) === lane), ...shown.filter((s) => suggestionLane(s) !== lane)];
}

// The suggestions whose likely role is `lane` (counted on its closed Add).
export function suggestedFor(suggestions: FranchiseSuggestion[], lane: FranchiseRole, hidden: (franchiseId: number) => boolean): number {
  return suggestions.filter((s) => suggestionLane(s) === lane && !hidden(s.franchise.franchise_id)).length;
}

// Narrowed by what is typed in the slot's search (two characters or more).
export function matchingSuggestions(suggestions: FranchiseSuggestion[], query: string): FranchiseSuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return suggestions;
  return suggestions.filter((s) => s.franchise.name.toLowerCase().includes(q));
}

// Dismissed suggestions live in the browser, per member per game: the key
// names both, the value is the dismissed Franchise ids.
export function dismissedKey(memberId: string, gameId: number): string {
  return `rpgclub:franchise-suggestions-dismissed:${memberId}:${gameId}`;
}

export function parseDismissed(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is number => Number.isInteger(v) && v > 0) : [];
  } catch {
    return [];
  }
}
