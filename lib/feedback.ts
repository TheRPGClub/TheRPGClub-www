import type { SessionMembership } from "@/lib/auth-types";
import type { Feedback, FeedbackKind } from "@/lib/api/types";
import { isMemberOrStaff } from "@/lib/staff";

// Pure helpers for the Feedback Board, the Give feedback form and the review
// desk. The API decides every write; these keep the form honest and the
// cards readable. Client-safe.

// The three kinds, in the board's tab order and the glossary's words. `ink`
// is a Theme token, used on Feedback surfaces only.
export const FEEDBACK_KINDS = [
  {
    value: "feature_request",
    label: "Feature Request",
    plural: "Feature Requests",
    ink: "var(--color-kind-feature-request)",
    blurb: "Something new the club or the bot should do",
  },
  {
    value: "suggestion",
    label: "Suggestion",
    plural: "Suggestions",
    ink: "var(--color-kind-suggestion)",
    blurb: "A change to something the club or the bot already does",
  },
  {
    value: "bug_report",
    label: "Bug Report",
    plural: "Bug Reports",
    ink: "var(--color-kind-bug-report)",
    blurb: "Something on the site or the bot that's broken",
  },
] as const satisfies readonly {
  value: FeedbackKind;
  label: string;
  plural: string;
  ink: string;
  blurb: string;
}[];

export type FeedbackKindMeta = (typeof FEEDBACK_KINDS)[number];

export function isFeedbackKind(raw: unknown): raw is FeedbackKind {
  return FEEDBACK_KINDS.some((k) => k.value === raw);
}

export function kindMeta(kind: FeedbackKind): FeedbackKindMeta {
  return FEEDBACK_KINDS.find((k) => k.value === kind) ?? FEEDBACK_KINDS[0];
}

// The bot's limits on its /feedback modal (every long field takes 4000).
export const FEEDBACK_TITLE_MAX = 256;
export const FEEDBACK_DETAILS_MAX = 4000;

// Where a Bug Report happened, in the API's words and the form's.
export const FEEDBACK_WHERES = [
  { value: "bot", label: "Bot" },
  { value: "website", label: "Website" },
] as const;

export type FeedbackWhere = (typeof FEEDBACK_WHERES)[number]["value"];

// What the form sends. A Feature Request or Suggestion has details; a Bug
// Report has where, what happened, what was expected and (optionally) steps.
export interface FeedbackInput {
  kind: FeedbackKind;
  title: string;
  details?: string;
  where?: FeedbackWhere;
  what_happened?: string;
  expected?: string;
  steps?: string | null;
}

// The form as typed, before checking.
export interface FeedbackDraft {
  kind: string | null;
  title: string;
  details?: string;
  where?: string | null;
  what_happened?: string;
  expected?: string;
  steps?: string;
}

type Checked<T> = { ok: true; value: T } | { ok: false; error: string };

function longText(raw: string | undefined, missing: string | null, name: string): Checked<string> {
  const text = (raw ?? "").trim();
  if (!text && missing) return { ok: false, error: missing };
  if (text.length > FEEDBACK_DETAILS_MAX) {
    return { ok: false, error: `Keep ${name} to ${FEEDBACK_DETAILS_MAX} characters.` };
  }
  return { ok: true, value: text };
}

function isWhere(raw: unknown): raw is FeedbackWhere {
  return FEEDBACK_WHERES.some((w) => w.value === raw);
}

function bugFields(raw: FeedbackDraft): Checked<Omit<FeedbackInput, "kind" | "title">> {
  if (!isWhere(raw.where)) return { ok: false, error: "Say where it happened: the bot or the website." };
  const happened = longText(raw.what_happened, "Say what happened.", "what happened");
  if (!happened.ok) return happened;
  const expected = longText(raw.expected, "Say what you expected to happen.", "what you expected");
  if (!expected.ok) return expected;
  const steps = longText(raw.steps, null, "the steps");
  if (!steps.ok) return steps;
  return {
    ok: true,
    value: { where: raw.where, what_happened: happened.value, expected: expected.value, steps: steps.value || null },
  };
}

// Check Feedback the way the API and the bot's modal do: a kind and a title,
// then details, or a Bug Report's where, what happened and what was expected
// (steps optional). Returns the clean payload or the first problem.
export function validateFeedbackInput(
  raw: FeedbackDraft,
): { ok: true; data: FeedbackInput } | { ok: false; error: string } {
  if (!isFeedbackKind(raw.kind)) return { ok: false, error: "Pick what kind of feedback it is." };
  const title = raw.title.replace(/\s+/g, " ").trim();
  if (!title) return { ok: false, error: "Give it a title." };
  if (title.length > FEEDBACK_TITLE_MAX) {
    return { ok: false, error: `Keep the title to ${FEEDBACK_TITLE_MAX} characters.` };
  }
  if (raw.kind === "bug_report") {
    const bug = bugFields(raw);
    return bug.ok ? { ok: true, data: { kind: raw.kind, title, ...bug.value } } : bug;
  }
  const details = longText(raw.details, "Say what it should do in the details.", "the details");
  if (!details.ok) return details;
  return { ok: true, data: { kind: raw.kind, title, details: details.value } };
}

// A Bug Report's screenshot. The API takes 5 MB, but the file goes through a
// server action and Vercel refuses a function request body over about 4.5 MB
// before Next sees it, so the website's cap is 4 MB (as the live event image).
export const SCREENSHOT_MAX_BYTES = 4 * 1024 * 1024;
export const SCREENSHOT_TYPES: readonly string[] = ["image/png", "image/jpeg", "image/webp"];
export const SCREENSHOT_ACCEPT = SCREENSHOT_TYPES.join(",");

// A problem with the picked screenshot, or null when the API will take it.
export function screenshotProblem(file: { type: string; size: number }): string | null {
  if (file.size === 0) return "That file is empty.";
  if (!SCREENSHOT_TYPES.includes(file.type)) return "Use a PNG, JPEG or WebP image.";
  if (file.size > SCREENSHOT_MAX_BYTES) return "The screenshot is larger than 4 MB. Crop it or save it as a JPEG.";
  return null;
}

// Who may give feedback and upvote: Members role holders and staff, as the
// API's `member_or_staff?` gate.
export function canGiveFeedback(m: SessionMembership | null | undefined): boolean {
  return isMemberOrStaff(m);
}

function isAuthor(f: Feedback, viewerId: string | null | undefined): boolean {
  return !!viewerId && f.created_by === viewerId;
}

// Withdraw and Edit: only the author, and only while it is Pending.
export function canWithdraw(f: Feedback, viewerId: string | null | undefined): boolean {
  return f.status === "pending" && isAuthor(f, viewerId);
}

export const canEdit = canWithdraw;

// Upvotes count while Pending or Approved and not Done; otherwise the count
// is frozen (the API answers 409).
export function canUpvote(f: Feedback): boolean {
  return (f.status === "pending" || f.status === "approved") && !f.done;
}

// The upvote button's words: on a Bug Report a member says they hit it too.
export function upvoteLabel(kind: FeedbackKind, upvoted: boolean): string {
  if (kind === "bug_report") return upvoted ? "You hit this too" : "I hit this too";
  return upvoted ? "Upvoted" : "Upvote";
}

// What a card shows. Done is an Approved Feedback whose GitHub issue was
// closed as completed; it is a phase of the card, not a status of its own.
export type FeedbackPhase = "pending" | "approved" | "done" | "rejected" | "duplicate" | "withdrawn";

export function feedbackPhase(f: Pick<Feedback, "status" | "done">): FeedbackPhase {
  if (f.status === "approved" && f.done) return "done";
  return f.status;
}

// Each phase's band ink (a Theme token), with ink type on it. In the Monthly
// Issue: Pending is paper, Approved teal, Done green, Rejected hot pink,
// Duplicate dim paper; Withdrawn is an outline.
export const PHASE_INK: Record<FeedbackPhase, string> = {
  pending: "var(--color-foreground)",
  approved: "var(--color-phase-approved)",
  done: "var(--color-phase-done)",
  rejected: "var(--color-phase-rejected)",
  duplicate: "var(--color-dim-foreground)",
  withdrawn: "var(--color-border-strong)",
};

export const PHASE_LABEL: Record<FeedbackPhase, string> = {
  pending: "Pending",
  approved: "Approved",
  done: "Done",
  rejected: "Rejected",
  duplicate: "Duplicate",
  withdrawn: "Withdrawn",
};

// Closed phases: their upvote count is history, and a slip may hang below.
export function isClosedPhase(phase: FeedbackPhase): boolean {
  return phase === "rejected" || phase === "duplicate" || phase === "withdrawn";
}

// ─── The board ───────────────────────────────────────────────────────────────

// The Feedback Board shows one kind at a time, Open (Pending and Approved,
// Done last) or Closed (Rejected, Duplicate and Withdrawn).
export type BoardStatus = "open" | "closed";

export function boardStatus(raw: string | undefined): BoardStatus | null {
  if (raw === "open" || raw === "closed") return raw;
  return null;
}

export function boardKind(raw: string | undefined): FeedbackKind | null {
  return isFeedbackKind(raw) ? raw : null;
}

// The board's URL for a kind and status; Open is the default status and
// Feature Requests the default kind, so neither is written.
export function boardHref(kind: FeedbackKind, status: BoardStatus = "open"): string {
  const qs = new URLSearchParams();
  if (kind !== FEEDBACK_KINDS[0].value) qs.set("kind", kind);
  if (status !== "open") qs.set("status", status);
  const q = qs.toString();
  return q ? `/feedback?${q}` : "/feedback";
}

// The deep links the Give feedback dialog (www#226) opens from: a new one
// (of the shown kind) or the author's edit of a Pending one.
export function giveFeedbackHref(kind?: FeedbackKind): string {
  return kind ? `/feedback?new=1&kind=${kind}` : "/feedback?new=1";
}

export function editFeedbackHref(f: Pick<Feedback, "feedback_id">): string {
  return `/feedback?edit=${f.feedback_id}`;
}

// What the Give feedback dialog opens as, from the board's URL: `?new=1`
// (of `kind`) for Members role holders and staff, `?edit=<id>` for the
// author of a Pending one; anything else that asks for it says why not.
export type FeedbackDialogState =
  | { mode: "create"; kind: FeedbackKind }
  | { mode: "edit"; feedback: Feedback }
  | { mode: "refused"; message: string };

export function feedbackDialogState({
  isNew,
  editId,
  editItem,
  kind,
  canGive,
  viewerId,
}: {
  isNew: boolean;
  editId: number;
  editItem: Feedback | null;
  kind: FeedbackKind;
  canGive: boolean;
  viewerId: string;
}): FeedbackDialogState | null {
  if (editId > 0) {
    if (!editItem) return { mode: "refused", message: "That Feedback no longer exists." };
    if (canEdit(editItem, viewerId)) return { mode: "edit", feedback: editItem };
    return {
      mode: "refused",
      message: isAuthor(editItem, viewerId)
        ? "It has already been reviewed, so it can't be edited."
        : "Only its author can edit it.",
    };
  }
  if (!isNew) return null;
  if (!canGive) return { mode: "refused", message: "Only Members role holders and staff can give feedback." };
  return { mode: "create", kind };
}

// The board's URL once the dialog closes: the same, without `new` or `edit`.
export function dialogClosedHref(params: URLSearchParams): string {
  const qs = new URLSearchParams(params);
  qs.delete("new");
  qs.delete("edit");
  const q = qs.toString();
  return q ? `/feedback?${q}` : "/feedback";
}

// Where a Feedback sits on the board: its kind's tab, Open or Closed, and
// rung in yellow.
export function pinnedHref(f: Pick<Feedback, "feedback_id">): string {
  return `/feedback?pinned=${f.feedback_id}`;
}

// A Duplicate's original, for its slip's link.
export interface DuplicateOriginal {
  feedback_id: number;
  title: string;
}

// "www #61" for TheRPGClub/TheRPGClub-www issue 61; null before approval.
export function issueRef(
  f: Pick<Feedback, "target_repo" | "github_issue_number">,
): string | null {
  if (f.github_issue_number == null) return null;
  const repo = f.target_repo?.split("/").pop() ?? "";
  const short = repo.replace(/^TheRPGClub-/i, "").toLowerCase();
  return short ? `${short} #${f.github_issue_number}` : `#${f.github_issue_number}`;
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

export function votesLabel(n: number): string {
  return n === 1 ? "vote" : "votes";
}

// ─── Review (Superadmins) ────────────────────────────────────────────────────

// The repos an approval can open its GitHub issue in, as the API's
// `RpgClubFeedback::TARGET_REPOS` lists them.
export const FEEDBACK_TARGET_REPOS = [
  { value: "TheRPGClub/TheRPGClub-bot", label: "Bot", blurb: "The Discord bot" },
  { value: "TheRPGClub/TheRPGClub-www", label: "Website", blurb: "This site" },
  { value: "TheRPGClub/TheRPGClub-api", label: "API", blurb: "The server behind both" },
] as const;

export type FeedbackTargetRepo = (typeof FEEDBACK_TARGET_REPOS)[number]["value"];

export function isFeedbackTargetRepo(value: string): value is FeedbackTargetRepo {
  return FEEDBACK_TARGET_REPOS.some((r) => r.value === value);
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
