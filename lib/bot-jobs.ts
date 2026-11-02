import type { BotJob, BotJobStatus } from "@/lib/api/types";

// What a member sees of a bot job: still waiting, done, or failed. A claimed
// job (the bot has picked it up but not acked it) still reads as waiting; the
// copy says the bot is on it.
export type BotJobPhase = "queued" | "done" | "failed";

export function botJobPhase(status: BotJobStatus): BotJobPhase {
  if (status === "done" || status === "failed") return status;
  return "queued";
}

// Done and failed are final: the API never moves a job on from either.
export function isBotJobSettled(job: Pick<BotJob, "status">): boolean {
  return botJobPhase(job.status) !== "queued";
}

// After an action, re-read the job at these gaps (ms), then stop and offer a
// manual check. The bot polls the queue about every 10 seconds, so most jobs
// settle inside the first two or three reads; the whole run is under a minute.
export const BOT_JOB_REFRESH_DELAYS_MS: readonly number[] = [3_000, 6_000, 10_000, 15_000, 20_000];

export interface BotJobStatusCopy {
  label: string;
  detail: string;
}

// The status line. `what` names the Discord side of the action in the
// member's words ("Your DM"), defaulting to a generic phrase.
export function botJobStatusCopy(job: BotJob, what = "The Discord update"): BotJobStatusCopy {
  switch (job.status) {
    case "queued":
      return { label: "Queued", detail: `${what} is waiting for the bot.` };
    case "claimed":
      return { label: "Queued", detail: "The bot is working on it." };
    case "done":
      return { label: "Done", detail: `${what} went out on Discord.` };
    case "failed":
      return {
        label: "Failed",
        detail: job.error_message?.trim() || "The bot couldn't finish this.",
      };
  }
}

// A failed read, by HTTP status. 403 and 404 won't change on a retry.
export function botJobReadError(status: number): { message: string; final: boolean } {
  if (status === 401) return { message: "Sign in again to check this.", final: true };
  if (status === 403) return { message: "You can't see this job's status.", final: true };
  if (status === 404) return { message: "That bot job doesn't exist.", final: true };
  return { message: `Couldn't check with the bot (HTTP ${status}).`, final: false };
}
