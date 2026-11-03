"use server";

import { apiFetch } from "@/lib/api";
import type { ApiCollection, BotJob, CollectionMeta } from "@/lib/api/types";
import { botJobReadError, WIRE_PAGE_SIZE } from "@/lib/bot-jobs";

export interface BotJobReadResult {
  ok: boolean;
  data?: BotJob;
  error?: string;
  // The read can't succeed on a retry (403, 404, signed out): stop polling.
  final?: boolean;
}

// Read a bot job's status. The API lets the member who queued the job,
// Admins and Superadmins read it; anyone else gets 403.
export async function getBotJobAction(id: number): Promise<BotJobReadResult> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "That bot job doesn't exist.", final: true };
  }

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/bot_jobs/${id}`, { cache: "no-store" });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) {
    const { message, final } = botJobReadError(res.status);
    return { ok: false, error: message, final };
  }

  const body = (await res.json()) as { data: BotJob };
  return { ok: true, data: body.data };
}

export interface BotJobListResult {
  ok: boolean;
  data?: BotJob[];
  meta?: CollectionMeta;
  error?: string;
}

// One page of the wire, newest first. Admins and Superadmins get every
// job; Moderators only the jobs they queued; anyone else 403.
export async function listBotJobsAction(page = 1): Promise<BotJobListResult> {
  const p = Number.isInteger(page) && page > 0 ? page : 1;
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/bot_jobs?page=${p}&per=${WIRE_PAGE_SIZE}`, {
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Sign in again to see the wire." };
    if (res.status === 403) return { ok: false, error: "Only staff can see the wire." };
    return { ok: false, error: `Couldn't read the wire (HTTP ${res.status}).` };
  }
  const body = (await res.json()) as ApiCollection<BotJob>;
  return { ok: true, data: body.data, meta: body.meta };
}
