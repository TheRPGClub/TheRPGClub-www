import type { ThreadSearchResult } from "@/lib/api/types";

// The game page's link controls: alternate versions (Admins) and Discord
// threads (Regulars, or Moderator and up). Pure helpers, shared by the
// actions and the pickers.

export type GameLinkAction = "version" | "thread-link" | "thread-unlink";

// A refusal in the member's words, by HTTP status.
export function gameLinkErrorMessage(
  action: GameLinkAction,
  status: number,
  message?: string,
): string {
  if (status === 401) return "Your session has ended. Sign in again.";
  if (status === 403) {
    return action === "version"
      ? "Only Admins and Superadmins can link versions."
      : "Only Regulars, Moderators, Admins and Superadmins can link threads.";
  }
  if (status === 404) {
    return action === "version"
      ? "That game no longer exists."
      : "That thread no longer exists.";
  }
  if (status === 422) {
    return action === "version"
      ? "A game can't be a version of itself, and the other game must exist."
      : "That game no longer exists.";
  }
  return message ?? `Request failed (HTTP ${status}).`;
}

// Why a picked game can't be linked as a version of `gameId`, or null.
export function versionPickProblem(
  pickedId: number,
  gameId: number,
  alternateIds: readonly number[],
): string | null {
  if (pickedId === gameId) return "That's this game. Pick another one.";
  if (alternateIds.includes(pickedId)) return "Already linked as a version.";
  return null;
}

// Whether a search result is already linked to `gameId`, and the other games
// it is linked to (a thread can link to several).
export function threadLinkState(
  result: ThreadSearchResult,
  gameId: number,
): { linkedHere: boolean; others: string[] } {
  return {
    linkedHere: result.games.some((g) => g.game_id === gameId),
    others: result.games.filter((g) => g.game_id !== gameId).map((g) => g.title),
  };
}
