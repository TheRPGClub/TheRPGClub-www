"use server";

import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { BotJob, ImageBackfillRun } from "@/lib/api/types";
import { hasSayProblems, validateSay, type SayInput } from "@/lib/say";

// The Superadmin tools on /admin: say as the bot, memberscan, and the image
// backfill. The API makes the final call on who may use them; these shape
// the request and put refusals in staff words.

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

function refusal(status: number): string | null {
  if (status === 401) return "Your session has ended. Sign in again.";
  if (status === 403) return "Only Superadmins can use this.";
  return null;
}

export interface BotJobQueuedResult {
  ok: boolean;
  job?: BotJob;
  error?: string;
}

async function queue(path: string, body?: unknown): Promise<BotJobQueuedResult> {
  let res: Response;
  try {
    res = await apiFetch(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    const known = refusal(res.status);
    if (known) return { ok: false, error: known };
    return { ok: false, error: apiErrorMessage(await readApiError(res)) };
  }
  const json = (await res.json()) as { data: BotJob };
  return { ok: true, job: json.data };
}

// Queue a `say` job: the bot posts the message, or replies to the linked one.
export async function sayAction(input: SayInput): Promise<BotJobQueuedResult> {
  const problems = validateSay(input);
  if (hasSayProblems(problems)) {
    return { ok: false, error: problems.channel ?? problems.content ?? problems.replyLink };
  }
  const link = input.replyLink.trim();
  return queue("/api/v1/bot_say", {
    data: {
      channel_id: input.channelId,
      content: input.content.trim(),
      reply_to_message_link: link || null,
    },
  });
}

// Queue a `memberscan` job. Two clicks queue two scans, as the API allows.
export async function startMemberscanAction(): Promise<BotJobQueuedResult> {
  return queue("/api/v1/memberscan");
}

export interface BackfillResult {
  ok: boolean;
  // The latest run; null before the first one.
  run?: ImageBackfillRun | null;
  error?: string;
  // A run is already queued or running (409).
  inProgress?: boolean;
}

// The newest image backfill run, null before any.
export async function latestBackfillAction(): Promise<BackfillResult> {
  let res: Response;
  try {
    res = await apiFetch("/api/v1/image_backfill_runs/latest", { cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (res.status === 404) return { ok: true, run: null };
  if (!res.ok) {
    return {
      ok: false,
      error: refusal(res.status) ?? `Couldn't read the image download (HTTP ${res.status}).`,
    };
  }
  const json = (await res.json()) as { data: ImageBackfillRun };
  return { ok: true, run: json.data };
}

// Start a run. Refused while one is queued or running.
export async function startBackfillAction(): Promise<BackfillResult> {
  let res: Response;
  try {
    res = await apiFetch("/api/v1/image_backfill_runs", { method: "POST", cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (res.status === 409) {
    return { ok: false, inProgress: true, error: "A download is already running. Its progress is below." };
  }
  if (!res.ok) {
    const known = refusal(res.status);
    return { ok: false, error: known ?? apiErrorMessage(await readApiError(res)) };
  }
  const json = (await res.json()) as { data: ImageBackfillRun };
  return { ok: true, run: json.data };
}
