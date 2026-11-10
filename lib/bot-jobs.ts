import type { BotJob, BotJobKind, BotJobStatus } from "@/lib/api/types";

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

// A schedule as gaps (ms): each step's gap repeated until that step's
// running total (from the first read) is reached.
function backoffDelays(steps: readonly { every: number; until: number }[]): number[] {
  const delays: number[] = [];
  let total = 0;
  for (const { every, until } of steps) {
    while (total + every <= until) {
      delays.push(every);
      total += every;
    }
  }
  return delays;
}

// For a job that runs for minutes (a memberscan has a 30 minute lease):
// every 10 s for the first 2 minutes, every 30 s to 10 minutes, then every
// minute to 35 minutes, a little past the lease.
export const BOT_JOB_LONG_REFRESH_DELAYS_MS: readonly number[] = backoffDelays([
  { every: 10_000, until: 120_000 },
  { every: 30_000, until: 600_000 },
  { every: 60_000, until: 2_100_000 },
]);

// Jobs per page on the /admin wire.
export const WIRE_PAGE_SIZE = 25;

export interface BotJobStatusCopy {
  label: string;
  detail: string;
}

// The status line. `what` names the Discord side of the action in the
// member's words ("Your DM"), defaulting to a generic phrase. `showResult`
// (staff surfaces only) puts what the bot reported on Done in place of the
// worded line; members never see the bot's raw result text.
export function botJobStatusCopy(
  job: BotJob,
  what = "The Discord update",
  { showResult = false }: { showResult?: boolean } = {},
): BotJobStatusCopy {
  switch (job.status) {
    case "queued":
      return { label: "Queued", detail: `${what} is waiting for the bot.` };
    case "claimed":
      return { label: "Queued", detail: "The bot is working on it." };
    case "done":
      return {
        label: "Done",
        detail: (showResult && job.result_text?.trim()) || `${what} went out on Discord.`,
      };
    case "failed":
      return {
        label: "Failed",
        detail: botJobFailureReason(job.error_message) || "The bot couldn't finish this.",
      };
  }
}

// The bot's dispatcher prefixes every handler failure with "Bot job N (kind)
// failed: " (or a newline before a request dump). That label is for the logs;
// the member reads the reason after it.
const DISPATCHER_PREFIX = /^Bot job \d+ \([a-z_]+\) failed(?::\s*|\n)/;

export function botJobFailureReason(message: string | null | undefined): string {
  return (message ?? "").trim().replace(DISPATCHER_PREFIX, "").trim();
}

// A failed read, by HTTP status. 403 and 404 won't change on a retry.
export function botJobReadError(status: number): { message: string; final: boolean } {
  if (status === 401) return { message: "Sign in again to check this.", final: true };
  if (status === 403) return { message: "You can't see this job's status.", final: true };
  if (status === 404) return { message: "That bot job doesn't exist.", final: true };
  return { message: `Couldn't check with the bot (HTTP ${status}).`, final: false };
}

// The wire's headline for a job: the kind of Discord action, in staff
// words. A ticket that adds a kind adds its label here; an unlisted kind
// reads as its humanised name ("member_scan" -> "Member scan").
const KIND_LABEL: Partial<Record<BotJobKind, string>> = {
  completion_announce: "Completion announcement",
  giveaway_claim_notice: "Giveaway claim",
  giveaway_hub_refresh: "Giveaway hub",
  nomination_deleted: "Nomination change",
  suggestion_submitted: "New Suggestion",
  suggestion_outcome: "Suggestion outcome",
  voting_poll_wakeup: "Voting wake-up",
  voting_results_publish: "Publish results",
  voting_panels_repost: "Repost voting panels",
  voting_tie_broken: "Tie break",
  gotm_cache_reload: "GOTM cache reload",
  live_event_create: "Live event",
  say: "Say as the bot",
  memberscan: "Memberscan",
  presence_set: "Bot presence",
  feature_flag_changed: "Feature Flag change",
};

export function humanizeKind(kind: string): string {
  const words = kind.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function botJobKindLabel(kind: string): string {
  return KIND_LABEL[kind as BotJobKind] ?? humanizeKind(kind);
}

// The summary line under the headline, or null when it only repeats the
// kind (old jobs were backfilled with their humanised kind as the summary).
export function botJobSummaryLine(job: Pick<BotJob, "kind" | "summary">): string | null {
  const summary = job.summary?.trim();
  if (!summary) return null;
  const same = (a: string) => a.toLowerCase() === summary.toLowerCase();
  if (same(humanizeKind(job.kind)) || same(botJobKindLabel(job.kind))) return null;
  return summary;
}

// Who queued the job, for an Admin's wire; null for system jobs.
export function botJobRequester(job: Pick<BotJob, "requested_by" | "requested_by_user_id">): string | null {
  const user = job.requested_by;
  if (user) return user.global_name || user.username || user.user_id;
  return job.requested_by_user_id;
}

// The wire's time stamp in the viewer's zone: the clock ("21:14") and the
// day under it ("Today", "Yesterday", "Nov 2"; with the year once it isn't
// this year's). `now` and `timeZone` are passed in so this stays pure.
export function wireStamp(
  iso: string,
  now: Date,
  timeZone?: string,
): { clock: string; day: string } {
  const at = new Date(iso);
  const clock = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const today = dayKey(now);
  const yesterday = dayKey(new Date(now.getTime() - 86_400_000));
  const key = dayKey(at);
  if (key === today) return { clock, day: "Today" };
  if (key === yesterday) return { clock, day: "Yesterday" };
  const sameYear = key.slice(0, 4) === today.slice(0, 4);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  }).format(at);
  return { clock, day };
}

// "just now", "12 min ago", "3 h ago", "2 d ago".
export function agoText(iso: string, now: Date): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

// The newest job of any of `kinds` in a newest-first list, when it failed.
export function latestFailure(
  jobs: readonly BotJob[],
  kinds: readonly string[],
): BotJob | null {
  const latest = jobs.find((j) => kinds.includes(j.kind));
  return latest && latest.status === "failed" ? latest : null;
}
