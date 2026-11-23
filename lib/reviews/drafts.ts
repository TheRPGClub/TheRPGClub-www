import { reviewBodyText } from "@/lib/api/review-body";
import type { ReviewDraftEntry } from "@/lib/api/types";
import { discardLoss } from "@/lib/reviews/draft";
import { sanitizeReviewFacets } from "@/lib/reviews/facets";
import { reviewHref } from "@/lib/reviews/href";

// Helpers for the viewer's own Drafts wherever they lie: the Your drafts
// page, the feed's drafts row, the game page and the member's reviews page.

// "Last touched …": minutes, hours, then days and weeks, then the date. The
// pile reads at a glance; the exact time sits in the title.
export function lastTouched(iso: string, now: number): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const minutes = Math.floor((now - at) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "last week";
  if (weeks < 5) return `${weeks} weeks ago`;
  return new Date(at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// The exact time, for the title: "23 Nov 2026, 14:02 UTC".
export function touchedAt(iso: string): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const date = new Date(at).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return `${date} UTC`;
}

// The first line of whatever is written so far: the story's first line, else
// the title, else null ("Nothing written yet").
export function draftFirstLine(draft: Pick<ReviewDraftEntry, "body" | "title">): string | null {
  const text = reviewBodyText(draft.body);
  const line = text
    ?.split("\n")
    .map((l) => l.trim())
    .find((l) => l !== "");
  if (line) return line;
  const title = draft.title?.trim();
  return title || null;
}

// The viewer's Draft of one game, if any: a Member has at most one Review per
// Game, Draft or Published.
export function draftOfGame<T extends Pick<ReviewDraftEntry, "gamedb_game_id" | "kind">>(
  drafts: T[],
  gameId: number,
): T | null {
  return drafts.find((d) => d.kind === "review" && d.gamedb_game_id === gameId) ?? null;
}

// "1 draft", "6 drafts".
export function draftCount(n: number): string {
  return `${n} ${n === 1 ? "draft" : "drafts"}`;
}

// What discarding a Draft from the pile throws away, as the editor names it.
export function draftLoss(draft: Pick<ReviewDraftEntry, "rating" | "facets" | "body">): string {
  return discardLoss({
    rating: draft.rating,
    hasScorecard: sanitizeReviewFacets(draft.facets) !== null,
    storyLength: reviewBodyText(draft.body)?.length ?? 0,
  });
}

// Where Continue writing goes: a Draft Review's page (it opens in the desk),
// or a Draft Revision on its Review's page (`?revisit`).
export function draftHref(draft: Pick<ReviewDraftEntry, "review_id" | "kind">): string {
  return reviewHref(draft.review_id, { revisit: draft.kind === "revision" });
}

// The state pill's words: "Draft", or "Revisiting · was 72" on a Draft
// Revision (the Review's current score it would replace).
export function draftStateLabel(draft: Pick<ReviewDraftEntry, "kind" | "previous_rating">): string {
  if (draft.kind !== "revision") return "Draft";
  return draft.previous_rating != null ? `Revisiting · was ${draft.previous_rating}` : "Revisiting";
}
