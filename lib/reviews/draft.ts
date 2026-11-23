import type { Review } from "@/lib/api/types";
import type { AutosaveStatus } from "@/lib/reviews/autosave";

// A Review with no publish date is a Draft: only its author sees it.
export function isDraft(review: Pick<Review, "published_at">): boolean {
  return review.published_at == null;
}

export interface DraftChecklist {
  title: boolean;
  story: boolean;
  score: boolean;
}

// The foot strip's checklist. Only the score is required to publish; a title
// and a story are noted but optional (a quick take has neither).
export function draftChecklist({
  title,
  storyLength,
  rating,
}: {
  title: string;
  storyLength: number;
  rating: number | null;
}): DraftChecklist {
  return {
    title: title.trim() !== "",
    story: storyLength > 0,
    score: rating !== null,
  };
}

// What discarding throws away, named so the question says what is at stake:
// "Its score, scorecard and 412 characters go with it."
export function discardLoss({
  rating,
  hasScorecard,
  storyLength,
}: {
  rating: number | null;
  hasScorecard: boolean;
  storyLength: number;
}): string {
  const parts = [
    rating !== null && "score",
    hasScorecard && "scorecard",
    storyLength > 0 &&
      `${storyLength.toLocaleString("en-GB")} ${storyLength === 1 ? "character" : "characters"}`,
  ].filter((p): p is string => Boolean(p));
  if (parts.length === 0) return "It has nothing in it yet.";
  const list =
    parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
  // One thing goes; several go. "412 characters" is several on its own.
  const plural = parts.length > 1 || storyLength > 1;
  return `Its ${list} ${plural ? "go" : "goes"} with it.`;
}

// "just now", "2 min ago", "3 h ago", then the date.
export function savedAgo(at: number, now: number): string {
  const minutes = Math.floor((now - at) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

// The autosave register's words, after "Draft ·".
export function autosaveLabel(status: AutosaveStatus, now: number): string {
  switch (status.kind) {
    case "idle":
      return "nothing new to save";
    case "saving":
      return "saving";
    case "saved":
      return `saved ${savedAgo(status.at, now)}`;
    case "failed": {
      const seconds = Math.max(0, Math.ceil((status.retryAt - now) / 1000));
      return seconds > 0 ? `not saved · retrying in ${seconds}s` : "not saved · retrying";
    }
  }
}
