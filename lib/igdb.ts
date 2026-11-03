// Client-safe helpers for adding a game from IGDB and refreshing a game's
// release info. The API's gate for both is `member_or_staff?` (see
// `isMemberOrStaff` in lib/staff.ts).

import type { SessionMembership } from "@/lib/auth-types";
import { isMemberOrStaff } from "@/lib/staff";

export type IgdbAction = "search" | "add" | "refresh";

const ADD_NEEDS_MEMBERS = "Adding games from IGDB needs the Members role.";

// Why a viewer can't add a game from IGDB, or null when they can. Shapes the
// UI only: the API makes the final call.
export function igdbAddBlockedReason(
  signedIn: boolean,
  membership: SessionMembership | null | undefined,
): string | null {
  if (!signedIn) return "Sign in to add it from IGDB.";
  return isMemberOrStaff(membership) ? null : ADD_NEEDS_MEMBERS;
}

// The year an IGDB candidate first released, or null when undated.
export function igdbYear(firstReleaseDate: string | null | undefined): number | null {
  if (!firstReleaseDate) return null;
  const year = new Date(firstReleaseDate).getUTCFullYear();
  return Number.isNaN(year) ? null : year;
}

// The client's proxy for `GET /igdb/search` (the session cookie is HttpOnly).
export function igdbSearchHref(query: string, per = 8): string {
  const qs = new URLSearchParams({ q: query.trim(), per: String(per) });
  return `/api/igdb/search?${qs}`;
}

// A failed IGDB call, in words. `code` is the API's `error` field.
export function igdbErrorMessage(
  action: IgdbAction,
  status: number,
  code?: string | null,
): string {
  if (status === 401) return "Sign in again to use IGDB.";
  if (status === 403) {
    return action === "refresh"
      ? "Refreshing release info needs the Members role."
      : ADD_NEEDS_MEMBERS;
  }
  if (status === 404) {
    return action === "refresh"
      ? "IGDB has no entry for this game."
      : "IGDB no longer has that game.";
  }
  if (status === 422) {
    if (code === "igdb_not_configured") return "IGDB isn't set up on the club's server.";
    return action === "refresh"
      ? "This game isn't linked to IGDB, so it can't be refreshed."
      : "The club's server couldn't import this game from IGDB.";
  }
  if (status === 502) return "IGDB didn't answer. Try again in a moment.";
  if (action === "search") return "IGDB search failed. Try again.";
  return `Something went wrong (HTTP ${status}). Try again.`;
}

// What a release refresh reports: the bot's "Added N release entries" or
// "No additional release entries were found".
export function releaseRefreshSummary(added: number): {
  state: "added" | "current";
  text: string;
} {
  if (added > 0) {
    return {
      state: "added",
      text: `${added} ${added === 1 ? "release" : "releases"} added`,
    };
  }
  return { state: "current", text: "No additional release entries were found." };
}
