import { apiFetch } from "@/lib/api";
import type { ApiCollection, ApiSingle } from "@/lib/api/types";
import type { FranchiseChange, FranchisePage, FranchiseProgress, FranchiseProgressMember } from "./types";
import { browseApiPath, type BrowseQuery, type FranchiseTile } from "./browse";

// Server-side reads for /franchises/:id. Never cached: the page carries the
// viewer's rights and shows an edit at once.

export type FranchiseRead = { status: "ok"; page: FranchisePage } | { status: "missing" };

// The Franchise's page, or "missing" for an unknown id. Any other failure
// throws to the route's error boundary.
export async function fetchFranchisePage(id: number): Promise<FranchiseRead> {
  const res = await apiFetch(`/api/v1/franchises/${id}`, { cache: "no-store" });
  if (res.status === 404) return { status: "missing" };
  if (!res.ok) throw new Error(`The Franchise couldn't be loaded (HTTP ${res.status}).`);
  return { status: "ok", page: ((await res.json()) as ApiSingle<FranchisePage>).data };
}

export const HISTORY_PAGE = 100;

// The newest changes, for Regulars and above (the API's gate), or null when
// the read fails or the viewer may not read it.
export async function fetchFranchiseChanges(id: number): Promise<{ changes: FranchiseChange[]; total: number } | null> {
  try {
    const res = await apiFetch(`/api/v1/franchises/${id}/changes?per=${HISTORY_PAGE}`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiCollection<FranchiseChange>;
    return { changes: body.data, total: body.meta?.count ?? body.data.length };
  } catch {
    return null;
  }
}

// A member's Franchise Progress (the viewer's without `userId`), or null when
// the `franchise_progress` Feature is closed to the viewer (the API's 404),
// the member is unknown, or the read fails: the page then goes without the
// Progress tab rather than failing.
export async function fetchFranchiseProgress(id: number, userId?: string): Promise<FranchiseProgress | null> {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  try {
    const res = await apiFetch(`/api/v1/franchises/${id}/progress${query}`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as ApiSingle<FranchiseProgress>).data;
  } catch {
    return null;
  }
}

// The Progress tab's Members table, in the API's order, or null when the
// read fails.
export async function fetchFranchiseProgressMembers(id: number): Promise<FranchiseProgressMember[] | null> {
  try {
    const res = await apiFetch(`/api/v1/franchises/${id}/progress/members`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as ApiCollection<FranchiseProgressMember>).data;
  } catch {
    return null;
  }
}

export const BROWSE_PER = 48;

export interface FranchiseTilePage {
  tiles: FranchiseTile[];
  total: number;
  pages: number;
}

// A page of the /franchises index (api#488), or null when the read fails:
// the wall then says so rather than failing the page. Never cached here:
// the tiles carry the viewer's Progress (the API caches the rest).
export async function fetchFranchiseTiles(query: BrowseQuery, per = BROWSE_PER): Promise<FranchiseTilePage | null> {
  try {
    const res = await apiFetch(browseApiPath(query, per), { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiCollection<FranchiseTile>;
    return { tiles: body.data, total: body.meta?.count ?? body.data.length, pages: body.meta?.pages ?? 1 };
  } catch {
    return null;
  }
}
