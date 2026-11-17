import { fetchChallenges, fetchMemberRunSheet } from "@/lib/api/challenges";
import { clubToday } from "@/lib/challenges/dates";
import { profileRuns, type ProfileRuns } from "@/lib/challenges/profile-runs";
import { challengeTint } from "@/lib/challenges/tint";

// A member's Runs (and Secret Santa sign-ups waiting for a draw) for their
// profile (server only). A Run names its Challenge
// but not its tint, so the Challenges list is read beside it for the tints;
// a Challenge the viewer can't see keeps its curated one. Null when the Runs
// can't be read.
export async function loadMemberRuns(userId: string): Promise<ProfileRuns | null> {
  const [sheet, challenges] = await Promise.all([fetchMemberRunSheet(userId), fetchChallenges()]);
  if (!sheet) return null;
  const tints = new Map((challenges ?? []).map((c) => [c.id, challengeTint(c)]));
  return profileRuns(sheet.runs, tints, clubToday(), sheet.signups);
}
