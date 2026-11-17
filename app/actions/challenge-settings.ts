"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { challengeDmsBody, type ChallengeSettings } from "@/lib/challenge-settings";
import { getSession } from "@/lib/session";

const UNREACHABLE = "Couldn't reach the club's server. Your switch is back where it was.";

export interface ChallengeDmsChange {
  dms: boolean;
}

export interface ChallengeSettingsResult {
  ok: boolean;
  data?: ChallengeSettings;
  error?: string;
}

// The Challenge DM opt-out on /settings, saved the moment it is flipped, as
// the signed-in member. The API answers with the whole document.
export async function saveChallengeDmsAction(change: ChallengeDmsChange): Promise<ChallengeSettingsResult> {
  if (typeof change?.dms !== "boolean") return { ok: false, error: "That switch can't be saved." };

  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to change your settings." };
  const userId = session.principal.discord_id;

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/challenge_settings`, {
      method: "PATCH",
      body: JSON.stringify(challengeDmsBody(change.dms)),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Sign in again to change your settings." };
    if (res.status === 403) return { ok: false, error: "You can only change your own settings." };
    if (res.status === 404) return { ok: false, error: "Challenges aren't open to you right now." };
    return { ok: false, error: apiErrorMessage(await readApiError(res)) };
  }
  const body = (await res.json()) as { data: ChallengeSettings };
  // The setting is this member's alone: refreshing their router re-reads
  // /settings, and the switch follows that read.
  refresh();
  return { ok: true, data: body.data };
}
