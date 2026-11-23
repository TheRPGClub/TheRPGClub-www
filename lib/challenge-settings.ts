import type { SessionFeature } from "@/lib/features";

// The member's Challenge settings (spec api#376, API api#379): the document
// `GET`/`PATCH /api/v1/users/:user_id/challenge_settings` serves. `dms` is
// the Challenge DM opt-out: whether the bot may DM them Challenge reminders
// (a Season they have a Run in ends soon). On until they turn it off.
// Client-safe: no server imports here.

export interface ChallengeSettings {
  user_id: string;
  dms: boolean;
}

export const CHALLENGES_FEATURE = "challenges";

// /settings' Challenge DM switch data: null (in place of this) when the
// Challenges Feature isn't shown to the member, so the switch is left out.
export interface ChallengeDmsData {
  // Null when the read failed.
  settings: ChallengeSettings | null;
  // Staff see Challenges only because it is in Preview.
  preview: boolean;
}

// Whether /settings shows the Challenge DM switch: only while the Challenges
// Feature is shown to this member (its flag, their Feature Preference, the
// staff Preview switch). Reads the session list by key rather than through
// `featureView`, so it works before `challenges` joins FEATURE_KEYS. A
// session with no list hides it: the API refuses the setting's endpoint
// while the Feature is unavailable, so there is nothing to switch.
export function challengeDmsShown(features: readonly SessionFeature[] | null | undefined): boolean {
  if (!Array.isArray(features)) return false;
  return features.some((f) => f.key === CHALLENGES_FEATURE && f.shown === true);
}

// The PATCH body for the switch.
export function challengeDmsBody(dms: boolean): { data: { dms: boolean } } {
  return { data: { dms } };
}
