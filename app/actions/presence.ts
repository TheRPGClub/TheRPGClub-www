"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { ApiCollection, BotPresence, BotPresenceCreateMeta, CollectionMeta } from "@/lib/api/types";
import { PRESENCE_PAGE_SIZE, validatePresenceName } from "@/lib/presence";

const PAGE = "/admin/presence";
const UNREACHABLE = "Couldn't reach the club's server. Try again.";

export interface SetPresenceResult {
  ok: boolean;
  data?: BotPresence;
  // The `presence_set` job it queued (meta.presence_job_id).
  jobId?: number | null;
  error?: string;
}

// Set the bot's presence. The API records the setter from the session and
// queues `presence_set`, whose id comes back as meta.presence_job_id.
export async function setPresenceAction(activityName: string): Promise<SetPresenceResult> {
  const checked = validatePresenceName(activityName);
  if (!checked.ok) return { ok: false, error: checked.error };

  let res: Response;
  try {
    res = await apiFetch("/api/v1/bot_presence", {
      method: "POST",
      body: JSON.stringify({ data: { activity_name: checked.name } }),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Sign in again to set the presence." };
    if (res.status === 403) {
      return { ok: false, error: "Only Moderators, Admins and Superadmins can set the bot's presence." };
    }
    return { ok: false, error: apiErrorMessage(await readApiError(res)) };
  }
  const { data, meta } = (await res.json()) as { data: BotPresence; meta?: BotPresenceCreateMeta };
  revalidatePath(PAGE);
  revalidatePath("/admin");
  return { ok: true, data, jobId: meta?.presence_job_id ?? null };
}

export interface PresenceHistoryResult {
  ok: boolean;
  data?: BotPresence[];
  meta?: CollectionMeta;
  error?: string;
}

// One page of the presence history, newest first.
export async function listPresenceAction(page = 1): Promise<PresenceHistoryResult> {
  const p = Number.isInteger(page) && page > 0 ? page : 1;
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/bot_presence?page=${p}&per=${PRESENCE_PAGE_SIZE}`, { cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 403) return { ok: false, error: "Only staff can see the presence history." };
    return { ok: false, error: `Couldn't read the presence history (HTTP ${res.status}).` };
  }
  const body = (await res.json()) as ApiCollection<BotPresence>;
  return { ok: true, data: body.data, meta: body.meta };
}
