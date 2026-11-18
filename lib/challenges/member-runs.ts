import { fetchMemberRunSheet } from "@/lib/api/challenges";
import { clubToday } from "@/lib/challenges/dates";
import { profileRuns, type ProfileRuns } from "@/lib/challenges/profile-runs";

// A member's Runs (and Secret Santa sign-ups waiting for a draw) for their
// profile (server only). Each Run carries its Challenge's tint. Null when
// the Runs can't be read.
export async function loadMemberRuns(userId: string): Promise<ProfileRuns | null> {
  const sheet = await fetchMemberRunSheet(userId);
  if (!sheet) return null;
  return profileRuns(sheet.runs, clubToday(), sheet.signups);
}
