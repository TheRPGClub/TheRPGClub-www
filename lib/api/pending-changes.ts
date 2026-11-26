import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import {
  pendingChangesValue,
  pendingChangeValue,
  type PendingChange,
  type PendingChangeActionResult,
} from "@/lib/patch-notes/pending-changes";

// The Patch editor's step 1 (www#240, api#514): Pending Changes for
// Admins and Superadmins signed in on the website, behind the Patch Notes
// gate. Server-only: it reaches lib/api.

const FETCH: RequestInit = { cache: "no-store" };

const ERRORS: Record<string, string> = {
  already_dismissed: "That one is dismissed already.",
  not_dismissed: "That one isn't dismissed.",
  covered: "A Patch covers that one. Untick it first.",
  dismissed: "One of those is dismissed. Undo the dismissal first.",
  covered_elsewhere: "Another Patch covers one of those. Reload to see where.",
  invalid_pending_changes: "That list of Pending Changes didn't make sense. Reload and try again.",
};

async function list(query: string): Promise<PendingChange[] | null> {
  const res = await apiFetch(`/api/v1/pending_changes?${query}&per=500`, FETCH);
  if (!res.ok) return null;
  const body = (await res.json()) as { data?: unknown };
  return pendingChangesValue(body.data);
}

// What step 1 shows for Patch `number`: every open and dismissed Pending
// Change, and the ones it covers. Null when any read fails.
export async function fetchPatchPendingChanges(number: number): Promise<PendingChange[] | null> {
  try {
    const reads = await Promise.all([list("status=open"), list(`status=covered&patch=${number}`), list("status=dismissed")]);
    return reads.some((r) => r === null) ? null : reads.flatMap((r) => r ?? []);
  } catch {
    return null;
  }
}

type Failure = { ok: false; error: string };
type Sent = { ok: true; data: unknown } | Failure;

async function failure(res: Response): Promise<Failure> {
  if (res.status === 401) return { ok: false, error: "Your session has ended. Sign in again." };
  if (res.status === 403) return { ok: false, error: "Only Admins can manage Pending Changes, while Patch Notes is open." };
  if (res.status === 404) return { ok: false, error: "That Pending Change or Patch is gone. Reload the page." };
  return { ok: false, error: apiErrorMessage(await readApiError(res), ERRORS) };
}

async function send(path: string, init: RequestInit): Promise<Sent> {
  try {
    const res = await apiFetch(path, { ...init, ...FETCH });
    if (!res.ok) return failure(res);
    const body = (await res.json().catch(() => ({}))) as { data?: unknown };
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
}

const validId = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n > 0;

// Dismisses (or, with `undo`, brings back) one Pending Change.
export async function dismissPendingChange(id: number, undo: boolean): Promise<PendingChangeActionResult> {
  if (!validId(id)) return { ok: false, error: "That Pending Change is gone. Reload the page." };
  const result = await send(`/api/v1/pending_changes/${id}/${undo ? "undismiss" : "dismiss"}`, { method: "POST" });
  if (!result.ok) return result;
  return { ok: true, change: pendingChangeValue(result.data) ?? undefined };
}

// Sets the whole list Patch `number` covers.
export async function coverPendingChanges(number: number, ids: number[]): Promise<PendingChangeActionResult> {
  if (!validId(number) || !ids.every(validId)) return { ok: false, error: ERRORS.invalid_pending_changes };
  const result = await send(`/api/v1/patches/${number}/pending_changes`, { method: "PUT", body: JSON.stringify({ data: { ids } }) });
  if (!result.ok) return result;
  return { ok: true, covered: pendingChangesValue(result.data) };
}
