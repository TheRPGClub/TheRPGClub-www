import type { Feedback, FeedbackKind, FeedbackTotals } from "@/lib/api/types";
import { fetchMemberNames } from "@/lib/api/members";
import { fetchFeedbackItem, fetchFeedbackList } from "@/lib/api/feedback";
import {
  FEEDBACK_KINDS,
  boardKind,
  boardStatus,
  feedbackPhase,
  isClosedPhase,
  type BoardStatus,
  type DuplicateOriginal,
} from "@/lib/feedback";

export type { BoardStatus, DuplicateOriginal };

export interface BoardData {
  kind: FeedbackKind;
  status: BoardStatus;
  // Every kind's counts for the tabs and the Open/Closed switch; null when
  // the read failed.
  totals: FeedbackTotals | null;
  // The shown kind and status's Feedback, or null when it couldn't be read.
  rows: Feedback[] | null;
  // The banner after a submit: only for the viewer's own, still Pending one.
  pinnedIsViewersPending: boolean;
  // Reviewers' names for the Rejected slips.
  reviewers: Map<string, string>;
  // Each Duplicate's original, by id, for its slip's link.
  originals: Map<number, DuplicateOriginal>;
}

// The Duplicates' originals in one read: an original is Pending or Approved
// (Done included) when marked, so every kind's Open Feedback holds them. One
// closed since is left out, and its slip links "another Feedback".
async function readOriginals(rows: Feedback[]): Promise<Map<number, DuplicateOriginal>> {
  const ids = new Set(rows.flatMap((f) => (f.duplicate_of_id ? [f.duplicate_of_id] : [])));
  if (ids.size === 0) return new Map();
  const open = await fetchFeedbackList({ statuses: ["open"] });
  return new Map(
    (open?.rows ?? [])
      .filter((f) => ids.has(f.feedback_id))
      .map((f) => [f.feedback_id, { feedback_id: f.feedback_id, title: f.title }] as const),
  );
}

// Reads the shown kind and status in full, with every kind's totals. A
// `pinned` Feedback picks the kind (and, unless one is asked for, the status)
// it sits under, so a link from Discord lands on it.
export async function loadBoard({
  kind: rawKind,
  status: rawStatus,
  pinned,
  viewerId,
}: {
  kind: string | undefined;
  status: string | undefined;
  pinned: number;
  viewerId: string;
}): Promise<BoardData> {
  const pinnedItem = pinned > 0 ? await fetchFeedbackItem(pinned) : null;
  const kind = pinnedItem?.kind ?? boardKind(rawKind) ?? FEEDBACK_KINDS[0].value;
  const status =
    boardStatus(rawStatus) ??
    (pinnedItem && isClosedPhase(feedbackPhase(pinnedItem)) ? "closed" : "open");

  const list = await fetchFeedbackList({ statuses: [status], kind });
  const rows = list?.rows ?? null;
  const [reviewers, originals] =
    status === "closed" && rows
      ? await Promise.all([
          fetchMemberNames(rows.filter((f) => f.status === "rejected").map((f) => f.reviewed_by)),
          readOriginals(rows),
        ])
      : [new Map<string, string>(), new Map<number, DuplicateOriginal>()];

  return {
    kind,
    status,
    totals: list?.totals ?? null,
    rows,
    pinnedIsViewersPending:
      !!pinnedItem && pinnedItem.status === "pending" && pinnedItem.created_by === viewerId,
    reviewers,
    originals,
  };
}
