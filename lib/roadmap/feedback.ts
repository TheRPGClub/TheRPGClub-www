// Feedback links on the Roadmap (spec api#505, www#233): the badge a linked
// Feedback wears on the Feedback Board, and the item dialog's Feedback
// picker. A Feedback sits on one Roadmap Item at most, so linking it to
// another moves it. Client-safe.
import type { Feedback, FeedbackRoadmap } from "@/lib/api/types";
import { PHASE_LABEL, feedbackPhase, kindMeta, pinnedHref } from "@/lib/feedback";
import type { Roadmap, RoadmapFeedback, RoadmapItem } from "./types";

// The badge's second line: the item's Milestone, or "Shipped" once it is.
export function roadmapPinLine(r: FeedbackRoadmap): string {
  return r.shipped ? "Shipped" : r.milestone_name;
}

const allItems = (r: Roadmap) => [...r.milestones, ...r.reached].flatMap((m) => m.items);

// The item a Feedback is linked to (other than `exceptItemId`), or null.
export function feedbackHolder(r: Roadmap, feedbackId: number, exceptItemId?: number): RoadmapItem | null {
  return allItems(r).find((i) => i.id !== exceptItemId && i.feedback.some((f) => f.id === feedbackId)) ?? null;
}

// A saved item took its Feedback from wherever it sat: every other item
// lets it go, as the API did.
export function claimFeedback(r: Roadmap, saved: RoadmapItem): Roadmap {
  const ids = new Set(saved.feedback.map((f) => f.id));
  if (ids.size === 0) return r;
  const release = (i: RoadmapItem) =>
    i.id === saved.id || !i.feedback.some((f) => ids.has(f.id)) ? i : { ...i, feedback: i.feedback.filter((f) => !ids.has(f.id)) };
  const each = (ms: Roadmap["milestones"]) => ms.map((m) => ({ ...m, items: m.items.map(release) }));
  return { milestones: each(r.milestones), reached: each(r.reached) };
}

// The picker's matches for `query`: titles holding it (any case), or "#12"
// for Feedback 12, leaving out what's already linked.
export function matchFeedback(all: readonly RoadmapFeedback[], query: string, linked: readonly number[], limit = 8): RoadmapFeedback[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const id = /^#(\d+)$/.exec(q)?.[1];
  return all
    .filter((f) => !linked.includes(f.id) && (id ? f.id === Number(id) : f.title.toLowerCase().includes(q)))
    .slice(0, limit);
}

// Where a linked Feedback's title points: pinned on the Feedback Board, or
// nowhere (a plain title) when the viewer can't open the board
// (`boardHref` null).
export function linkedFeedbackHref(boardHref: string | null, feedbackId: number): string | null {
  return boardHref ? pinnedHref({ feedback_id: feedbackId }) : null;
}

// "Feature Request · Approved", "Bug Report · Done".
export function feedbackLine(f: RoadmapFeedback): string {
  return `${kindMeta(f.kind).label} · ${PHASE_LABEL[feedbackPhase(f)]}`;
}

export function toRoadmapFeedback(f: Feedback): RoadmapFeedback {
  return { id: f.feedback_id, title: f.title, kind: f.kind, status: f.status, done: f.done };
}
