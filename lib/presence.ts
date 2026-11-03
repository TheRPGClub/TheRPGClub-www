import type { BotJob, BotPresence } from "@/lib/api/types";

// Pure helpers for the /admin/presence tool.

// Discord caps an activity name at 128 characters; a longer one saves but
// the bot can't apply it.
export const PRESENCE_MAX = 128;

// History rows per page (the API serves at most 50).
export const PRESENCE_PAGE_SIZE = 50;

export function validatePresenceName(
  raw: string,
): { ok: true; name: string } | { ok: false; error: string } {
  const name = raw.trim();
  if (!name) return { ok: false, error: "Say what the bot is playing." };
  if (name.length > PRESENCE_MAX) {
    return { ok: false, error: `Keep it to ${PRESENCE_MAX} characters; Discord cuts the rest.` };
  }
  return { ok: true, name };
}

// Who set a presence: their name, their id, or the bot itself (its hourly
// re-assert and old rows carry no setter).
export function presenceSetter(p: Pick<BotPresence, "set_by_user_id" | "set_by_username">): string {
  return p.set_by_username?.trim() || p.set_by_user_id || "The bot";
}

// The presence POST returns the row, not its job, so the job is the newest
// `presence_set` the setter queued at about the same time (the list is newest
// first, and a Moderator only sees their own).
export function findPresenceJob(
  jobs: readonly BotJob[],
  userId: string,
  setAt: string,
  slackMs = 60_000,
): BotJob | null {
  const since = Date.parse(setAt) - slackMs;
  return (
    jobs.find(
      (j) =>
        j.kind === "presence_set" &&
        j.requested_by_user_id === userId &&
        Date.parse(j.created_at) >= since,
    ) ?? null
  );
}
