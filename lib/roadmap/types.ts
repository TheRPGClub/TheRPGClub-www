// The Roadmap as the API sends it (spec api#505, `GET /api/v1/roadmap`).
// Client-safe: types only.
import type { DatePrecision, FeedbackKind, FeedbackStatus } from "@/lib/api/types";

// Whether a Roadmap Item touches the bot, the website or both; null when
// staff didn't say.
export type RoadmapArea = "bot" | "website" | "both";

export interface RoadmapItem {
  id: number;
  milestone_id: number;
  title: string;
  blurb: string;
  area: RoadmapArea | null;
  github_issue_url: string | null;
  position: number;
  // When staff marked it Shipped (ISO time); null until then.
  shipped_at: string | null;
  // Its linked Feedback, oldest first (www#233). A Feedback sits on one
  // item at most.
  feedback: RoadmapFeedback[];
}

// A Feedback linked to a Roadmap Item, as the item carries it.
export interface RoadmapFeedback {
  id: number;
  title: string;
  kind: FeedbackKind;
  status: FeedbackStatus;
  // Approved with its GitHub issue closed.
  done: boolean;
}

export interface RoadmapMilestone {
  id: number;
  name: string;
  blurb: string | null;
  // YYYY-MM-DD, the first day of its period; null when TBA.
  target_date: string | null;
  date_precision: DatePrecision;
  position: number;
  // When staff marked it Reached (ISO time); null while it is open.
  reached_at: string | null;
  // In staff order.
  items: RoadmapItem[];
}

export interface Roadmap {
  // Open Milestones in staff order: the tree's tiers.
  milestones: RoadmapMilestone[];
  // Reached Milestones, newest Reached first: the "Already learned" shelf.
  reached: RoadmapMilestone[];
}
