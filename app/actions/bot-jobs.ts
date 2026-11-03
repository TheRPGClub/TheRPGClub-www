"use server";

import { apiFetch } from "@/lib/api";
import type { BotJob } from "@/lib/api/types";
import { botJobReadError } from "@/lib/bot-jobs";

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
