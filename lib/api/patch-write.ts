import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { PatchFields } from "@/lib/patch-notes/patch-draft";
import type { BotJob } from "@/lib/api/types";
import type { Patch, PatchActionResult, PatchPostResult } from "@/lib/patch-notes/types";

// The Patch editor's reads and writes (www#237, api#511), for Admins and
// Superadmins signed in on the website. The API refuses everyone else, and
// everyone while Patch Notes is Off. Server-only: it reaches lib/api.

export type { PatchActionResult };

const FETCH: RequestInit = { cache: "no-store" };

export const UNREACHABLE = "Couldn't reach the club's server. Try again.";

const ERRORS: Record<string, string> = {
  already_published: "That Patch is published already.",
  not_published: "That Patch isn't published.",
  published: "Unpublish the Patch before deleting it.",
  gone: "That Patch is gone. Someone may have deleted it.",
  already_posted: "That Patch is on #patch-notes already. Update the post instead.",
  post_queued: "That Patch is already on its way to #patch-notes.",
  not_posted: "That Patch isn't on #patch-notes, so there's no post to update.",
};

function validNumber(number: unknown): number is number {
  return typeof number === "number" && Number.isInteger(number) && number > 0;
}

async function failure(res: Response): Promise<PatchActionResult> {
  if (res.status === 401) return { ok: false, error: "Your session has ended. Sign in again." };
  if (res.status === 403) return { ok: false, error: "Only Admins can write Patches, while Patch Notes is open." };
  if (res.status === 404) return { ok: false, error: ERRORS.gone };
  return { ok: false, error: apiErrorMessage(await readApiError(res), ERRORS) };
}

async function send(path: string, init: RequestInit): Promise<PatchActionResult> {
  try {
    const res = await apiFetch(path, { ...init, ...FETCH });
    if (!res.ok) return failure(res);
    const body = (await res.json().catch(() => ({}))) as { data?: Patch };
    return { ok: true, patch: body.data };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}

// Every Patch, drafts too, newest first. Null when it can't be read.
export async function fetchStaffPatches(): Promise<Patch[] | null> {
  try {
    const res = await apiFetch("/api/v1/patches?status=all&per=500", FETCH);
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: Patch[] };
    return Array.isArray(body.data) ? body.data : [];
  } catch {
    return null;
  }
}

// One Patch, a draft too; "not_found" for an unknown number, null when it
// can't be read.
export async function fetchStaffPatch(number: number): Promise<Patch | "not_found" | null> {
  try {
    const res = await apiFetch(`/api/v1/patches/${number}`, FETCH);
    if (res.status === 404) return "not_found";
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: Patch };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export function createPatch(fields: PatchFields): Promise<PatchActionResult> {
  return send("/api/v1/patches", { method: "POST", body: JSON.stringify({ data: fields }) });
}

export function savePatch(number: number, fields: PatchFields): Promise<PatchActionResult> {
  if (!validNumber(number)) return Promise.resolve({ ok: false, error: ERRORS.gone });
  return send(`/api/v1/patches/${number}`, { method: "PATCH", body: JSON.stringify({ data: fields }) });
}

export function patchStep(number: number, step: "publish" | "unpublish"): Promise<PatchActionResult> {
  if (!validNumber(number)) return Promise.resolve({ ok: false, error: ERRORS.gone });
  return send(`/api/v1/patches/${number}/${step}`, { method: "POST" });
}

export function deletePatch(number: number): Promise<PatchActionResult> {
  if (!validNumber(number)) return Promise.resolve({ ok: false, error: ERRORS.gone });
  return send(`/api/v1/patches/${number}`, { method: "DELETE" });
}

// Queues the bot's post of a published Patch, or the edit of its post
// (www#239, api#513): 202 with the bot job.
export async function queuePatchPost(number: number, step: "post" | "update_post"): Promise<PatchPostResult> {
  if (!validNumber(number)) return { ok: false, error: ERRORS.gone };
  try {
    const res = await apiFetch(`/api/v1/patches/${number}/${step}`, { method: "POST", ...FETCH });
    if (!res.ok) return failure(res);
    const body = (await res.json().catch(() => ({}))) as { data?: BotJob };
    return { ok: true, job: body.data };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}
