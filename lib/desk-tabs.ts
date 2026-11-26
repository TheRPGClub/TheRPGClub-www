// The Staff desk's tabs (/admin, design pick 2026-11-23): one tab per job
// group the viewer can use (Voting, The bot, Members, GameDB, Feature
// Flags), then Bot jobs, always there. Each tab carries a short state line
// under its name. The tab is kept in the URL (`?tab=bot`); the first tab is
// the default and has no parameter. Bot jobs can open on a filter
// (`?tab=jobs&show=failed`). Client-safe: no server imports.

import type { BotJob, BotJobKind } from "@/lib/api/types";
import { agoText } from "@/lib/bot-jobs";
import type { DeskNotes, DeskReadings } from "@/lib/staff-desk";
import { STAFF_SECTIONS, type StaffDeskGroup, type StaffGroup } from "@/lib/staff";

export type DeskTab = StaffGroup | "jobs";

export const BOT_JOBS_LABEL = "Bot jobs";

// The tabs for the viewer's groups, in order, Bot jobs last.
export function deskTabsFor(groups: readonly StaffDeskGroup[]): DeskTab[] {
  return [...groups.map((g) => g.key), "jobs"];
}

// `?tab=` read leniently: anything unknown, or a group the viewer can't use,
// opens the first tab.
export function parseDeskTab(raw: unknown, tabs: readonly DeskTab[]): DeskTab {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return tabs.find((t) => t === value) ?? tabs[0];
}

// The URL for a tab (and Bot jobs' filter), kept by replacing the history
// entry as tabs change.
export function deskTabHref(tab: DeskTab, tabs: readonly DeskTab[], show: JobsShow = "all"): string {
  const params = new URLSearchParams();
  if (tab !== tabs[0]) params.set("tab", tab);
  if (tab === "jobs" && show !== "all") params.set("show", show);
  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

// What Bot jobs shows: every job, or those still waiting, or the failed.
export type JobsShow = "all" | "queued" | "failed";

export function parseJobsShow(raw: unknown): JobsShow {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "queued" || value === "failed" ? value : "all";
}

// Jobs no tool queues, filed under the group they belong to.
const UNLISTED_KINDS: Partial<Record<BotJobKind, StaffGroup>> = {
  voting_poll_wakeup: "voting",
  feedback_submitted: "members",
};

// The group a job belongs to: the group of the tool that queues its kind;
// null for jobs no desk tool owns (the Giveaways' own posts).
export function jobGroup(kind: string): StaffGroup | null {
  const section = STAFF_SECTIONS.find((s) => s.jobKinds?.includes(kind as BotJobKind));
  return section?.group ?? UNLISTED_KINDS[kind as BotJobKind] ?? null;
}

export const isWaiting = (job: Pick<BotJob, "status">) => job.status === "queued" || job.status === "claimed";

export function showsJob(job: BotJob, show: JobsShow, from: StaffGroup | null): boolean {
  if (show === "queued" && !isWaiting(job)) return false;
  if (show === "failed" && job.status !== "failed") return false;
  return from === null || jobGroup(job.kind) === from;
}

export interface TabNote {
  note: string;
  tone?: "live" | "bad";
}

// A group's state: its live news (the round, pending Feedback, the last
// flag change), then what its jobs are doing ("1 queued", "2 failed").
// Failures win the tone, then the open round.
export function groupTabNote(
  group: StaffDeskGroup,
  notes: DeskNotes,
  r: Pick<DeskReadings, "pendingFeedback" | "jobs">,
  now: Date,
): TabNote {
  const parts: string[] = [];
  const mine = r.jobs.filter((j) => jobGroup(j.kind) === group.key);
  if (group.key === "voting" && notes.voting?.tone === "live") parts.push(notes.voting.text);
  if (group.key === "members" && r.pendingFeedback) parts.push(`${r.pendingFeedback} pending`);
  if (group.key === "flags" && mine[0]) parts.push(`Changed ${agoText(mine[0].created_at, now)}`);
  const waiting = mine.filter(isWaiting).length;
  if (waiting) parts.push(`${waiting} queued`);
  const failed = group.sections.filter((s) => notes[s.key]?.tone === "bad").length;
  if (failed) parts.push(`${failed} failed`);
  const tone = failed ? "bad" : group.key === "voting" && parts.length ? "live" : undefined;
  return { note: parts.join(" · "), tone };
}

// Bot jobs' state over the jobs read: failures first, then what's waiting.
export function jobsTabNote(jobs: readonly BotJob[]): TabNote {
  const failed = jobs.filter((j) => j.status === "failed").length;
  if (failed) return { note: `${failed} failed`, tone: "bad" };
  const waiting = jobs.filter(isWaiting).length;
  if (waiting) return { note: `${waiting} queued` };
  return { note: jobs.length ? "All done" : "None yet" };
}
