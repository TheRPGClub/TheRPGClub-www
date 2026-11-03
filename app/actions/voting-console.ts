"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { readApiError } from "@/lib/api/errors";
import type { BotJob, VotingCategory, VotingRound } from "@/lib/api/types";
import { VOTING_CATEGORY_PATH } from "@/lib/api/voting-round";
import { consoleErrorText } from "@/lib/voting-console";

// The voting console's writes (/admin/voting). Admin and up; the API
// decides every gate and window. Refusals come back as the API's own words
// (consoleErrorText), so a 422 the console doesn't know yet still reads.

export interface ConsoleResult<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

function validRound(round: number): boolean {
  return Number.isInteger(round) && round > 0;
}

function refresh() {
  revalidatePath("/admin/voting");
  revalidatePath("/voting");
}

async function send<T>(
  path: string,
  init: RequestInit,
  read: (body: unknown) => T,
): Promise<ConsoleResult<T>> {
  let res: Response;
  try {
    res = await apiFetch(path, { cache: "no-store", ...init });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) return { ok: false, error: consoleErrorText(await readApiError(res)) };
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // An empty success body: nothing to read.
  }
  refresh();
  return { ok: true, data: read(body) };
}

const roundOf = (body: unknown) => (body as { data: VotingRound }).data;
const jobOf = (body: unknown) => (body as { data: BotJob }).data;

// Move when this round's vote opens (the "Next vote" pin). The API keeps the
// default weekend window, so the close moves with it, and wakes the poller.
export async function rescheduleVoteAction(
  round: number,
  opensAtIso: string,
): Promise<ConsoleResult<VotingRound>> {
  if (!validRound(round) || Number.isNaN(Date.parse(opensAtIso))) {
    return { ok: false, error: "Pick a date and time." };
  }
  return send(
    `/api/v1/voting_rounds/${round}`,
    { method: "PATCH", body: JSON.stringify({ data: { voting_opens_at: opensAtIso } }) },
    roundOf,
  );
}

// End the vote now: the close moved to the present. The poller wakes and
// the bot posts the results as it would at the scheduled close.
export async function closeVotingNowAction(round: number): Promise<ConsoleResult<VotingRound>> {
  if (!validRound(round)) return { ok: false, error: "That round doesn't exist." };
  return send(
    `/api/v1/voting_rounds/${round}`,
    {
      method: "PATCH",
      body: JSON.stringify({ data: { voting_closes_at: new Date().toISOString() } }),
    },
    roundOf,
  );
}

// Delete every vote on one ballot: a category's main vote, or its runoff.
export async function resetVotesAction(
  category: VotingCategory,
  round: number,
  runoff: boolean,
): Promise<ConsoleResult<{ count: number }>> {
  if (!validRound(round) || !(category in VOTING_CATEGORY_PATH)) {
    return { ok: false, error: "That ballot doesn't exist." };
  }
  return send(
    `/api/v1/${VOTING_CATEGORY_PATH[category]}/${round}/votes${runoff ? "?runoff=true" : ""}`,
    { method: "DELETE" },
    (body) => ({ count: Number((body as { count?: number } | null)?.count ?? 0) }),
  );
}

// Queue the results post and winner thread (the bot's job). Repeatable.
export async function publishResultsAction(round: number): Promise<ConsoleResult<BotJob>> {
  if (!validRound(round)) return { ok: false, error: "That round doesn't exist." };
  return send(`/api/v1/voting_rounds/${round}/publish_results`, { method: "POST" }, jobOf);
}

// Queue a repost of the current round's voting panels.
export async function repostPanelsAction(): Promise<ConsoleResult<BotJob>> {
  return send(`/api/v1/voting_rounds/current/repost_panels`, { method: "POST" }, jobOf);
}

// Record a tied category's winner(s). More than one makes joint winners.
export async function resolveTieAction(
  round: number,
  category: VotingCategory,
  gameIds: number[],
): Promise<ConsoleResult<VotingRound>> {
  const ids = gameIds.filter((id) => Number.isInteger(id) && id > 0);
  if (!validRound(round) || !(category in VOTING_CATEGORY_PATH)) {
    return { ok: false, error: "That tie doesn't exist." };
  }
  if (ids.length === 0) return { ok: false, error: "Pick at least one winner." };
  return send(
    `/api/v1/voting_rounds/${round}/resolve_tie`,
    { method: "POST", body: JSON.stringify({ data: { category, gamedb_game_ids: ids } }) },
    roundOf,
  );
}
