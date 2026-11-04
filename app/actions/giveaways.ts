"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { GameKey, GameKeyClaimMeta } from "@/lib/api/types";
import { getSession } from "@/lib/session";
import {
  CLAIM_REFUSAL_COPY,
  DONATION_GAME_ERRORS,
  claimRefusal,
  validateDonation,
  type ClaimRefusal,
  type DonationInput,
} from "@/lib/giveaways";

const PAGES = ["/giveaways", "/giveaways/donate", "/giveaways/claimed"];

function revalidate() {
  for (const page of PAGES) revalidatePath(page);
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

export interface GiveawayActionResult<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
}

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

// Put a key on the shelf, as the signed-in member.
export async function donateKeyAction(input: DonationInput): Promise<GiveawayActionResult<GameKey>> {
  const checked = validateDonation(input);
  if (!checked.ok) return { ok: false, error: checked.error };
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to donate a key." };

  const data = { ...checked.data, donor_user_id: session.principal.discord_id };

  let res: Response;
  try {
    res = await apiFetch("/api/v1/game_keys", { method: "POST", body: JSON.stringify({ data }) });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    return {
      ok: false,
      error: apiErrorMessage(err, {
        ...DONATION_GAME_ERRORS,
        forbidden: "You can only donate keys as yourself.",
      }),
    };
  }
  revalidate();
  const body = (await res.json()) as { data: GameKey };
  return { ok: true, data: body.data };
}

// Take a key off the shelf. The API allows its donor, Admins and Superadmins.
export async function revokeKeyAction(id: number): Promise<GiveawayActionResult> {
  if (!validId(id)) return { ok: false, error: "That key is no longer on the shelf." };
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/game_keys/${id}`, { method: "DELETE" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 403) {
      return { ok: false, error: "Only the key's donor, Admins and Superadmins can take it off the shelf." };
    }
    if (res.status === 404) {
      revalidate();
      return { ok: false, error: "That key is already gone." };
    }
    return { ok: false, error: apiErrorMessage(await readApiError(res)) };
  }
  revalidate();
  return { ok: true };
}

export interface ClaimResult {
  ok: boolean;
  key?: GameKey;
  jobId?: number | null;
  refusal?: ClaimRefusal;
  error?: string;
}

// Claim a key. The API checks the Members role and settles a race: the loser
// gets 409. A win returns the key with its secret and the DM job's id.
export async function claimKeyAction(id: number): Promise<ClaimResult> {
  if (!validId(id)) return { ok: false, refusal: "gone", error: CLAIM_REFUSAL_COPY.gone };
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/game_keys/${id}/claim`, { method: "POST", body: JSON.stringify({}) });
  } catch {
    return { ok: false, refusal: "other", error: UNREACHABLE };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    const refusal = claimRefusal(err.status, err.code);
    if (refusal !== "not_member" && refusal !== "signed_out") revalidate();
    return {
      ok: false,
      refusal,
      error: refusal === "other" ? apiErrorMessage(err) : CLAIM_REFUSAL_COPY[refusal],
    };
  }
  revalidate();
  const body = (await res.json()) as { data: GameKey; meta?: GameKeyClaimMeta };
  return { ok: true, key: body.data, jobId: body.meta?.claim_notice_job_id ?? null };
}
