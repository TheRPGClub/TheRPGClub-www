import { apiFetch } from "@/lib/api";
import type { ApiCollection, ApiSingle } from "@/lib/api/types";
import type { FranchiseChange, FranchisePage } from "./types";

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
