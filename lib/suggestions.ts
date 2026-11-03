import type { SessionMembership } from "@/lib/auth-types";
import type { Suggestion } from "@/lib/api/types";
import { isMemberOrStaff } from "@/lib/staff";

// Pure helpers for the Suggestion form and the Suggestion Board. The API
// decides every write; these keep the form honest and the cards readable.

// The bot's /suggestion types, in its order and spelling: they are stored
// comma-joined in `labels` and become the GitHub issue's labels on approval,
// so the website must not invent new ones.
export const SUGGESTION_TYPES = [
  { value: "New Feature", ink: "#ffcf9e", blurb: "Something it can't do yet" },
  { value: "Improvement", ink: "#7fe0d6", blurb: "Make something better" },
  { value: "Bug", ink: "#e8d28f", blurb: "Something is broken" },
] as const;

export type SuggestionType = (typeof SUGGESTION_TYPES)[number]["value"];

// A label the bot doesn't know (older rows) prints in Dim Paper.
const UNKNOWN_TYPE_INK = "#b9b9b2";

export function suggestionTypeInk(label: string): string {
  return (
    SUGGESTION_TYPES.find((t) => t.value.toLowerCase() === label.toLowerCase())
      ?.ink ?? UNKNOWN_TYPE_INK
  );
}

// "New Feature, Bug" -> ["New Feature", "Bug"].
export function parseSuggestionLabels(labels: string | null | undefined): string[] {
  if (!labels) return [];
  return labels
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
}

// The bot's limits on its /suggestion modal.
export const SUGGESTION_TITLE_MAX = 256;
export const SUGGESTION_DETAILS_MAX = 4000;

export interface SuggestionInput {
  title: string;
  details: string;
  labels: string;
}

// Check a Suggestion the way the bot's modal does: a title, details and at
// least one known type. Returns the clean payload or the first problem.
export function validateSuggestionInput(raw: {
  title: string;
  details: string;
  types: readonly string[];
}): { ok: true; data: SuggestionInput } | { ok: false; error: string } {
  const title = raw.title.replace(/\s+/g, " ").trim();
  if (!title) return { ok: false, error: "Give it a title." };
  if (title.length > SUGGESTION_TITLE_MAX) {
    return { ok: false, error: `Keep the title to ${SUGGESTION_TITLE_MAX} characters.` };
  }
  const details = raw.details.trim();
  if (!details) return { ok: false, error: "Say what it should do in the details." };
  if (details.length > SUGGESTION_DETAILS_MAX) {
    return {
      ok: false,
      error: `Keep the details to ${SUGGESTION_DETAILS_MAX} characters.`,
    };
  }
  const types = SUGGESTION_TYPES.map((t) => t.value).filter((v) =>
    raw.types.includes(v),
  );
  if (types.length === 0) return { ok: false, error: "Pick at least one type." };
  return { ok: true, data: { title, details, labels: types.join(", ") } };
}

// Who may suggest and upvote: Members role holders and staff, as the API's
// `member_or_staff?` gate.
export function canSuggest(m: SessionMembership | null | undefined): boolean {
  return isMemberOrStaff(m);
}

// Only the author, and only while it is Pending.
export function canWithdraw(s: Suggestion, viewerId: string | null | undefined): boolean {
  return s.status === "pending" && !!viewerId && s.created_by === viewerId;
}

// Upvotes count while a Suggestion is Pending or Approved.
export function canUpvote(s: Suggestion): boolean {
  return s.status === "pending" || s.status === "approved";
}

// What a card shows. Done is an Approved Suggestion whose GitHub issue is
// closed; it is a stamp on the card, not a status of its own.
export type SuggestionPhase = "pending" | "approved" | "done" | "rejected" | "withdrawn";

export function suggestionPhase(s: Pick<Suggestion, "status" | "github_issue_state">): SuggestionPhase {
  if (s.status === "approved" && s.github_issue_state === "closed") return "done";
  return s.status;
}

// Each phase's band ink, with ink type on it. Pending is paper, Approved
// teal, Done green, Rejected hot pink; Withdrawn is an outline.
export const PHASE_INK: Record<SuggestionPhase, string> = {
  pending: "#f4f4f0",
  approved: "#2ec4b6",
  done: "#5fd08a",
  rejected: "#ff4fa3",
  withdrawn: "#3a3a43",
};

export const PHASE_LABEL: Record<SuggestionPhase, string> = {
  pending: "Pending",
  approved: "Approved",
  done: "Done",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

// "www #61" for TheRPGClub/TheRPGClub-www issue 61; null before approval.
export function issueRef(
  s: Pick<Suggestion, "target_repo" | "github_issue_number">,
): string | null {
  if (s.github_issue_number == null) return null;
  const repo = s.target_repo?.split("/").pop() ?? "";
  const short = repo.replace(/^TheRPGClub-/i, "").toLowerCase();
  return short ? `${short} #${s.github_issue_number}` : `#${s.github_issue_number}`;
}

// A stable tilt within ±0.7deg from the id, so a card rests at the same angle
// on every visit (the Hand-Placed Rule).
export function cardTilt(id: number): number {
  const steps = [-0.7, 0.5, -0.4, 0.6, -0.5, 0.4, -0.6, 0.7];
  return steps[Math.abs(id) % steps.length];
}

// "Oct 30" (with the year when it isn't this one).
export function shortDate(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  }).format(d);
}

// The Rejected tab reads newest decision first.
export function byReviewedDesc(a: Suggestion, b: Suggestion): number {
  const at = Date.parse(a.reviewed_at ?? a.updated_at);
  const bt = Date.parse(b.reviewed_at ?? b.updated_at);
  return bt - at;
}

export function votesLabel(n: number): string {
  return n === 1 ? "vote" : "votes";
}

// ─── Review (Superadmins) ────────────────────────────────────────────────────

// The repos an approval can open its GitHub issue in, as the API's
// `RpgClubSuggestion::TARGET_REPOS` lists them.
export const SUGGESTION_TARGET_REPOS = [
  { value: "TheRPGClub/TheRPGClub-bot", label: "Bot", blurb: "The Discord bot" },
  { value: "TheRPGClub/TheRPGClub-www", label: "Website", blurb: "This site" },
  { value: "TheRPGClub/TheRPGClub-api", label: "API", blurb: "The server behind both" },
] as const;

export type SuggestionTargetRepo = (typeof SUGGESTION_TARGET_REPOS)[number]["value"];

export function isSuggestionTargetRepo(value: string): value is SuggestionTargetRepo {
  return SUGGESTION_TARGET_REPOS.some((r) => r.value === value);
}

// The API's cap on a rejection reason.
export const REJECTION_REASON_MAX = 2000;

// A reason the API will take: trimmed, present, within the cap.
export function validateRejectionReason(
  raw: string,
): { ok: true; reason: string } | { ok: false; error: string } {
  const reason = raw.trim();
  if (!reason) return { ok: false, error: "Say why it isn't going ahead." };
  if (reason.length > REJECTION_REASON_MAX) {
    return {
      ok: false,
      error: `Keep the reason to ${REJECTION_REASON_MAX} characters.`,
    };
  }
  return { ok: true, reason };
}
