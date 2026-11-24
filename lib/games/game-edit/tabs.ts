import type { SessionMembership } from "@/lib/auth-types";
import { isAdminOrAbove, isRegularOrStaff } from "@/lib/staff";
import type { GameEditViewer } from "./engine";

// /games/:id/edit's tabs (design www#156, round 3): one section a tab.
// Admins (and Superadmins) get all seven; a Regular, or staff below Admin,
// Game Threads and Franchises (api#442). Client-safe.

export const GAME_EDIT_TABS = ["text", "images", "threads", "releases", "versions", "hltb", "franchises"] as const;
export type GameEditTab = (typeof GAME_EDIT_TABS)[number];

export const GAME_EDIT_TAB_LABELS: Record<GameEditTab, string> = {
  text: "Text & video",
  images: "Images",
  threads: "Game Threads",
  releases: "Releases",
  versions: "Versions",
  hltb: "Time to beat",
  franchises: "Franchises",
};

// The viewer's gates from their membership, or null when they may not edit
// the game at all (the page is then a 404 and the hero has no Edit game).
// They mirror the API's: Admin for the record, Regulars-or-staff for threads.
export function gameEditViewer(membership: SessionMembership | null | undefined): GameEditViewer | null {
  const viewer = { admin: isAdminOrAbove(membership), threads: isRegularOrStaff(membership) };
  return viewer.admin || viewer.threads ? viewer : null;
}

export function gameEditTabsFor(viewer: GameEditViewer): GameEditTab[] {
  return viewer.admin ? [...GAME_EDIT_TABS] : ["threads", "franchises"];
}

// `?tab=` read leniently: anything unknown opens the first tab.
export function parseGameEditTab(raw: unknown, viewer: GameEditViewer): GameEditTab {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const tabs = gameEditTabsFor(viewer);
  return tabs.find((t) => t === value) ?? tabs[0];
}

export function gameEditHref(gameId: number, tab?: GameEditTab): string {
  return tab && tab !== "text" ? `/games/${gameId}/edit?tab=${tab}` : `/games/${gameId}/edit`;
}

// A tab's state line: "Unavailable" when its section can't be read,
// "Didn't save" after a failed save, else "2 staged".
export function gameEditTabNote(
  staged: number,
  failed: boolean,
  unavailable = false,
): { note: string; tone?: "staged" | "bad" } {
  if (unavailable) return { note: "Unavailable", tone: "bad" };
  if (failed) return { note: "Didn't save", tone: "bad" };
  if (staged > 0) return { note: `${staged} staged`, tone: "staged" };
  return { note: "" };
}
