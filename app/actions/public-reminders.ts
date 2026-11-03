"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { PublicReminder } from "@/lib/api/types";
import { getSession } from "@/lib/session";
import { validateReminderInput } from "@/lib/public-reminders";

export interface ReminderActionResult {
  ok: boolean;
  data?: PublicReminder;
  error?: string;
}

export interface ReminderFormInput {
  channel_id: string;
  message: string;
  // ISO 8601 with the admin's browser offset.
  due_at: string | null;
  recur_every: string | null;
  recur_unit: string | null;
}

const PAGE = "/admin/reminders";

async function errorMessage(res: Response): Promise<string> {
  if (res.status === 403)
    return "Only Admins and Superadmins can change public reminders.";
  if (res.status === 404) return "That reminder no longer exists.";
  return apiErrorMessage(await readApiError(res));
}

async function send(
  path: string,
  init: RequestInit,
): Promise<ReminderActionResult> {
  let res: Response;
  try {
    res = await apiFetch(path, init);
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) return { ok: false, error: await errorMessage(res) };
  revalidatePath(PAGE);
  if (init.method === "DELETE") return { ok: true };
  const body = (await res.json()) as { data: PublicReminder };
  return { ok: true, data: body.data };
}

export async function createPublicReminderAction(
  input: ReminderFormInput,
): Promise<ReminderActionResult> {
  const checked = validateReminderInput(input);
  if (!checked.ok) return { ok: false, error: checked.error };
  const session = await getSession();
  return send("/api/v1/public_reminders", {
    method: "POST",
    body: JSON.stringify({
      data: {
        ...checked.data,
        enabled: true,
        created_by: session?.principal.discord_id ?? null,
      },
    }),
  });
}

export async function updatePublicReminderAction(
  id: number,
  input: ReminderFormInput,
): Promise<ReminderActionResult> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "That reminder no longer exists." };
  }
  const checked = validateReminderInput(input);
  if (!checked.ok) return { ok: false, error: checked.error };
  return send(`/api/v1/public_reminders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ data: checked.data }),
  });
}

export async function deletePublicReminderAction(
  id: number,
): Promise<ReminderActionResult> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "That reminder no longer exists." };
  }
  return send(`/api/v1/public_reminders/${id}`, { method: "DELETE" });
}
