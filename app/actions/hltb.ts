"use server";

import { apiFetch } from "@/lib/api";
import { readApiError } from "@/lib/api/errors";
import {
  hltbFailureKind,
  type Hltb,
  type HltbLookupFailure,
  type HltbLookupMeta,
} from "@/lib/hltb";

export type HltbLookupResult =
  | { ok: true; data: Hltb; meta: HltbLookupMeta }
  | { ok: false; failure: HltbLookupFailure; message?: string };

// "Look up on HLTB": the API answers with the saved times when it has them,
// else searches HowLongToBeat and saves the result for games over six months
// old. The page never calls this on its own; only the button does.
export async function lookupHltbAction(
  gameId: number,
): Promise<HltbLookupResult> {
  if (!Number.isInteger(gameId) || gameId <= 0) {
    return { ok: false, failure: "other", message: "That game doesn't exist." };
  }
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/games/${gameId}/hltb/lookup`, {
      method: "POST",
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      failure: "other",
      message: "Couldn't reach the club's server. Try again.",
    };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    const failure = hltbFailureKind(res.status, err.code);
    return {
      ok: false,
      failure,
      message: failure === "other" ? err.message : undefined,
    };
  }
  const body = (await res.json()) as { data: Hltb; meta: HltbLookupMeta };
  return { ok: true, data: body.data, meta: body.meta };
}
