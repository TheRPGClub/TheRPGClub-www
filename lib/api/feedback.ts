import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import type {
  ApiCollection,
  Feedback,
  FeedbackKind,
  FeedbackTotals,
} from "@/lib/api/types";

// Server-only reads for the Feedback Board and the Superadmin review desk
// (they read the session cookie).

// The API's page size cap.
const MAX_PER = 500;

export interface FeedbackList {
  rows: Feedback[];
  total: number;
  // Every kind's Open, Closed and Done counts, whatever the filter.
  totals: FeedbackTotals | null;
}

// Feedback in the given statuses (`open`, `closed`, `done` or single
// statuses), optionally of one kind, in the board's order: Approved, Pending,
// Done, then closed, most upvoted first within each. Null when unreadable.
export async function fetchFeedbackList({
  statuses,
  kind,
  per = MAX_PER,
}: {
  statuses: readonly string[];
  kind?: FeedbackKind;
  per?: number;
}): Promise<FeedbackList | null> {
  const qs = new URLSearchParams({
    status: statuses.join(","),
    per: String(Math.min(Math.max(per, 1), MAX_PER)),
  });
  if (kind) qs.set("kind", kind);
  try {
    const res = await apiFetch(`/api/v1/feedback?${qs}`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiCollection<Feedback> & {
      meta?: { totals?: FeedbackTotals };
    };
    return {
      rows: body.data,
      total: paginationOf(body.meta, body.data.length).total,
      totals: body.meta?.totals ?? null,
    };
  } catch {
    return null;
  }
}

// One Feedback by id; null when it is missing or can't be read.
export async function fetchFeedbackItem(id: number): Promise<Feedback | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  try {
    const res = await apiFetch(`/api/v1/feedback/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as { data: Feedback }).data;
  } catch {
    return null;
  }
}
