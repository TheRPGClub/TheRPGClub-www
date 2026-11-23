import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import type { ApiCollection, ReviewDraftEntry } from "@/lib/api/types";

// How many of the viewer's Drafts a game's pages look through for that
// game's: the listing has no game filter (an API follow-up).
export const DRAFTS_READ = 100;

export interface DraftsPage {
  drafts: ReviewDraftEntry[];
  total: number;
  totalPages: number;
  // When they were read, for "Last touched …".
  now: number;
}

// The viewer's own Drafts, newest last-touched first. Only ever read for the
// signed-in member's own id: the API refuses anyone else (403), and a failed
// read is no Drafts rather than an error on a page that is about something
// else. Never cached: a Draft changes as it is written.
export async function fetchOwnDrafts(
  userId: string,
  { per = 50, page = 1 }: { per?: number; page?: number } = {},
): Promise<DraftsPage | null> {
  try {
    const res = await apiFetch(
      `/api/v1/users/${encodeURIComponent(userId)}/reviews/drafts?per=${per}&page=${page}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const body: ApiCollection<ReviewDraftEntry> = await res.json();
    const { total, totalPages } = paginationOf(body.meta, body.data.length);
    return { drafts: body.data, total, totalPages, now: Date.now() };
  } catch {
    return null;
  }
}
