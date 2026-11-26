import type { Feedback, FeedbackKind } from "@/lib/api/types";
import type { FeedbackTargetRepo } from "@/lib/feedback";

// Pure helpers for the Superadmin review desk (/admin/feedback): its kind
// lanes, the Approve repo's default, Reject's quick picks and the Duplicate
// original picker. Client-safe.

// One lane's Pending Feedback: its kind only, most upvoted first, then
// oldest first so a tie keeps the order it was filed in.
export function laneRows(rows: readonly Feedback[], kind: FeedbackKind): Feedback[] {
  return rows
    .filter((f) => f.kind === kind && f.status === "pending")
    .sort(
      (a, b) =>
        b.upvote_count - a.upvote_count ||
        a.created_at.localeCompare(b.created_at) ||
        a.feedback_id - b.feedback_id,
    );
}

// Approve's repo, pre-filled from a Bug Report's Where: the bot's repo for
// Bot, this site's for Website. Nothing for the other kinds.
export function defaultRepoFor(f: Pick<Feedback, "kind" | "where">): FeedbackTargetRepo | null {
  if (f.kind !== "bug_report") return null;
  if (f.where === "bot") return "TheRPGClub/TheRPGClub-bot";
  if (f.where === "website") return "TheRPGClub/TheRPGClub-www";
  return null;
}

// Reject's quick picks on a Bug Report; each fills the reason, which stays
// editable.
export const BUG_REJECT_PICKS = ["Can't reproduce", "Working as intended"] as const;

export function rejectPicksFor(kind: FeedbackKind): readonly string[] {
  return kind === "bug_report" ? BUG_REJECT_PICKS : [];
}

// "Website" / "Bot" for a Bug Report's Where.
export function whereLabel(where: Feedback["where"]): string | null {
  if (where === "bot") return "Bot";
  if (where === "website") return "Website";
  return null;
}

// What the Duplicate picker needs of a possible original.
export type DuplicateCandidate = Pick<
  Feedback,
  "feedback_id" | "kind" | "title" | "status" | "done" | "upvote_count"
>;

// A Feedback that can be another's original: Pending or Approved (Done
// included). Rejected, Withdrawn and Duplicate ones can't (the API answers
// 422).
export function isValidOriginal(f: Pick<Feedback, "status">): boolean {
  return f.status === "pending" || f.status === "approved";
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

// The originals the picker offers for `self`: valid ones other than itself
// whose title holds every word typed (any order), most upvoted first. The
// API has no title search, so the desk reads the Open Feedback once and
// filters here.
export function duplicateCandidates(
  rows: readonly DuplicateCandidate[],
  selfId: number,
  query: string,
  limit = 8,
): DuplicateCandidate[] {
  const words = norm(query).split(" ").filter(Boolean);
  return rows
    .filter((f) => f.feedback_id !== selfId && isValidOriginal(f))
    .filter((f) => {
      const title = norm(f.title);
      return words.every((w) => title.includes(w));
    })
    .sort((a, b) => b.upvote_count - a.upvote_count || a.feedback_id - b.feedback_id)
    .slice(0, limit);
}

// "Mark duplicate · 3 upvotes move there": the upvotes the Duplicate hands
// to its original.
export function duplicateButtonLabel(upvotes: number): string {
  if (upvotes <= 0) return "Mark duplicate";
  return `Mark duplicate · ${upvotes} ${upvotes === 1 ? "upvote moves" : "upvotes move"} there`;
}
