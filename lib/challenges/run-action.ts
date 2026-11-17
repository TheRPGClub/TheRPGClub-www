import type { ApiErrorBody } from "@/lib/api/errors";
import { closedNote, seasonAround, type IsoDay } from "@/lib/challenges/dates";
import type { Challenge, ChallengeRun } from "@/lib/challenges/types";

// What the viewer can do about their Run of a Challenge (surface brief
// challenges-pool: the action at the right of the switch; challenges-index:
// Start a Run on a flyer), the request each action sends, and how a refusal
// reads. Pure and client-safe; the API owns every rule, so this only picks
// the button, and a refusal still shows the API's own words.

export type RunAction =
  // "Abandon your Run" (signal orange) while it is Active.
  | { kind: "abandon"; runId: number }
  // "Start a Run" (yellow), or "Start a new Run" after an earlier one.
  | { kind: "start"; again: boolean }
  // Start a Run, disabled, with the reason ("Opens 22 Sep").
  | { kind: "closed"; reason: string }
  // Nothing to offer: this Season's Run is had, or an Assignment Challenge,
  // whose Runs come from an Edition's sign-up (www#110).
  | { kind: "none" };

// The viewer's Runs of one Challenge, whatever their status.
export function yourRunsOf(runs: readonly ChallengeRun[], challengeId: number, viewerId: string): ChallengeRun[] {
  return runs.filter((r) => r.challenge.id === challengeId && r.user.user_id === viewerId);
}

export function runActionFor(
  challenge: Pick<Challenge, "challenge_format" | "schedule" | "season" | "ends_on" | "open">,
  yourRuns: readonly ChallengeRun[],
  today: IsoDay,
): RunAction {
  const active = yourRuns.find((r) => r.status === "active");
  if (active) return { kind: "abandon", runId: active.id };
  if (challenge.challenge_format === "assignment") return { kind: "none" };
  if (!challenge.open) return { kind: "closed", reason: closedNote(challenge, today) ?? "Closed" };
  // One Run per Season, whatever became of it.
  if (challenge.schedule === "seasonal" && challenge.season) {
    const starts = seasonAround(challenge.season, today).starts;
    if (yourRuns.some((r) => r.window.starts_on === starts)) return { kind: "none" };
  }
  return { kind: "start", again: yourRuns.length > 0 };
}

export type RunChange =
  | { kind: "start"; challengeId: number }
  | { kind: "abandon"; runId: number }
  | { kind: "delete"; runId: number };

const validId = (id: number) => Number.isInteger(id) && id > 0;

// The API call for a change; null for an id that can't be one.
export function runRequest(change: RunChange): { path: string; method: "POST" | "DELETE" } | null {
  if (change.kind === "start") {
    return validId(change.challengeId) ? { path: `/api/v1/challenges/${change.challengeId}/runs`, method: "POST" } : null;
  }
  if (!validId(change.runId)) return null;
  return change.kind === "abandon"
    ? { path: `/api/v1/challenge_runs/${change.runId}/abandon`, method: "POST" }
    : { path: `/api/v1/challenge_runs/${change.runId}`, method: "DELETE" };
}

// Used only when the API sends no message of its own.
const FALLBACK: Record<string, string> = {
  challenge_closed: "This Challenge is Closed just now.",
  run_active: "You already have a Run of this Challenge going.",
  season_run_exists: "You've had your Run of this Season. The next Season brings another.",
  birth_date_required: "This Run starts at your birth year: set your Birth Date in Settings first.",
  signup_required: "Runs of this Challenge come from an Edition's sign-up.",
  no_slots: "Your birth year comes after this Challenge's last year, so there is nothing to fill.",
  run_not_active: "That Run isn't Active any more.",
};

export function runRefusal(err: ApiErrorBody): string {
  if (err.status === 401) return "Your session has ended. Sign in again.";
  if (err.message) return err.message;
  if (err.code && Object.hasOwn(FALLBACK, err.code)) return FALLBACK[err.code];
  if (err.status === 403) return "That isn't your Run.";
  if (err.status === 404) return "That Run or Challenge no longer exists, or is hidden.";
  return "That didn't work. Try again in a moment.";
}
