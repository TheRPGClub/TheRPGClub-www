"use client";

import type { BotJob } from "@/lib/api/types";
import { isWaiting, jobGroup, type JobsShow } from "@/lib/desk-tabs";
import type { StaffGroup } from "@/lib/staff";
import { Button } from "@/components/ui/button";

const SHOW: { key: JobsShow; label: string; count: (j: BotJob) => boolean }[] = [
  { key: "all", label: "All", count: () => true },
  { key: "queued", label: "Queued", count: isWaiting },
  { key: "failed", label: "Failed", count: (j) => j.status === "failed" },
];

// Bot jobs' filter: which jobs (All, Queued, Failed), then which tab's tools
// they came from, each with its count over the jobs read. The picked one
// carries the yellow ring; picking the picked group again shows them all.
export function BotJobsFilter({
  jobs,
  groups,
  show,
  from,
  onShow,
  onFrom,
}: {
  jobs: BotJob[];
  groups: { key: StaffGroup; label: string }[];
  show: JobsShow;
  from: StaffGroup | null;
  onShow: (show: JobsShow) => void;
  onFrom: (from: StaffGroup | null) => void;
}) {
  const row = (key: string, label: string, n: number, on: boolean, pick: () => void) => (
    <li key={key}>
      <Button
        type="button"
        variant="pick-row"
        size="bare"
        aria-pressed={on}
        onClick={pick}
        className="flex h-10 w-full items-center justify-between gap-3 px-3"
      >
        <span className="font-label text-[0.95rem] font-bold tracking-[0.06em]">{label}</span>
        <span className="font-headline text-[1.15rem] text-faint-foreground">{n}</span>
      </Button>
    </li>
  );
  return (
    <div data-slot="bot-jobs-filter">
      <h2 data-slot="desk-rule-head" className="font-headline border-b-2 border-foreground pb-2 text-[1.45rem]">Show</h2>
      <ul className="mt-1.5">{SHOW.map((s) => row(s.key, s.label, jobs.filter(s.count).length, show === s.key, () => onShow(s.key)))}</ul>
      <h3 className="font-label mt-5 border-b border-border-strong pb-1.5 text-[0.74rem] font-extrabold tracking-[0.08em] text-faint-foreground">
        From
      </h3>
      <ul className="mt-1.5">
        {groups.map((g) =>
          row(g.key, g.label, jobs.filter((j) => jobGroup(j.kind) === g.key).length, from === g.key, () =>
            onFrom(from === g.key ? null : g.key),
          ),
        )}
      </ul>
    </div>
  );
}
