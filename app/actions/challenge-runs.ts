"use server";

import { refresh, revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { readApiError } from "@/lib/api/errors";
import { runRefusal, runRequest, type RunChange } from "@/lib/challenges/run-action";
import { runNotices, type RunNotice } from "@/lib/challenges/slot-requests";

// Starting, abandoning and deleting the signed-in member's Runs. The API owns
// every rule (one Active Run, one per Season, a Closed Challenge, a Birth
// Date for a birth-year Slots Run) and writes its refusals for members, so
// those are shown as given.

export interface RunActionResult {
  ok: boolean;
  error?: string;
  // The refusal's code (`season_run_exists`, `birth_date_required`...).
  code?: string;
  // What a new Run's member should know (a birth-year Slots Run's "your birth
  // year shows").
  notices?: RunNotice[];
}

async function change(change: RunChange): Promise<RunActionResult> {
  const request = runRequest(change);
  if (!request) return { ok: false, error: "That Run or Challenge no longer exists." };
  let res: Response;
  try {
    res = await apiFetch(request.path, { method: request.method, cache: "no-store" });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    return { ok: false, error: runRefusal(err), code: err.code };
  }
  const notices = change.kind === "start" ? runNotices(await res.json().catch(() => null)) : [];
  // The index, the Challenge page and every profile show Runs.
  revalidatePath("/challenges", "layout");
  revalidatePath("/members/[id]", "page");
  refresh();
  return { ok: true, notices };
}

export async function startRunAction(challengeId: number): Promise<RunActionResult> {
  return change({ kind: "start", challengeId });
}

export async function abandonRunAction(runId: number): Promise<RunActionResult> {
  return change({ kind: "abandon", runId });
}

export async function deleteRunAction(runId: number): Promise<RunActionResult> {
  return change({ kind: "delete", runId });
}
