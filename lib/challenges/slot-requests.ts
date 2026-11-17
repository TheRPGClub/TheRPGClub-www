import type { ApiErrorBody } from "@/lib/api/errors";

// The calls behind a Slots Run's actions (`slot_move`, `past_pick`, the
// `past_play` list), how their refusals read, and the notices a new Run comes
// with. Pure and client-safe; the API owns every rule and words its refusals
// for members, so those are shown as given.

export interface SlotRequest {
  path: string;
  body: { data: Record<string, number> };
}

const whole = (n: number) => Number.isInteger(n) && n > 0;

export function slotMoveRequest(runId: number, gameId: number, year: number): SlotRequest | null {
  if (!whole(runId) || !whole(gameId) || !whole(year)) return null;
  return { path: `/api/v1/challenge_runs/${runId}/slot_move`, body: { data: { game_id: gameId, slot_year: year } } };
}

export function pastPickRequest(runId: number, completionId: number, year: number): SlotRequest | null {
  if (!whole(runId) || !whole(completionId) || !whole(year)) return null;
  return {
    path: `/api/v1/challenge_runs/${runId}/past_pick`,
    body: { data: { completion_id: completionId, slot_year: year } },
  };
}

export function pastPlayPath(runId: number, q: string): string {
  const query = q.trim();
  const base = `/api/v1/challenge_runs/${runId}/past_play`;
  return query ? `${base}?${new URLSearchParams({ q: query })}` : base;
}

// One of the member's Game Completions from before their Run, as the past-play
// list serves it.
export interface PastPlay {
  completion_id: number;
  game_id: number;
  title: string;
  // YYYY-MM-DD, null when undated.
  completed_at: string | null;
  // The Run's open years its game was released in.
  open_years: number[];
}

// Used only when the API sends no message of its own.
const FALLBACK: Record<string, string> = {
  slot_filled: "Another game already fills that year.",
  slot_not_fitting: "That game wasn't released in that year.",
  slot_out_of_range: "That year isn't one of your Run's.",
  not_cleared: "Only a Cleared game can move.",
  already_cleared: "That game is already Cleared on your Run: move it instead.",
  not_past_completion: "That Game Completion isn't from before your Run.",
  past_play_off: "This Challenge doesn't count past play.",
  run_not_active: "That Run isn't Active any more.",
  not_slots: "Only a Slots Run has years.",
};

export function slotRefusal(err: ApiErrorBody): string {
  if (err.status === 401) return "Your session has ended. Sign in again.";
  if (err.message) return err.message;
  if (err.code && Object.hasOwn(FALLBACK, err.code)) return FALLBACK[err.code];
  if (err.status === 403) return "Only the Run's member can change it.";
  if (err.status === 404) return "That Run no longer exists.";
  return "That didn't work. Try again in a moment.";
}

export interface RunNotice {
  code: string;
  message: string;
}

// `meta.notices` on a new Run (a birth-year Run's "your birth year shows").
export function runNotices(body: unknown): RunNotice[] {
  const notices = (body as { meta?: { notices?: unknown } } | null)?.meta?.notices;
  if (!Array.isArray(notices)) return [];
  return notices.filter(
    (n): n is RunNotice => !!n && typeof n.code === "string" && typeof n.message === "string",
  );
}
