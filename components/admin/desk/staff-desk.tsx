import type { BotJob, CollectionMeta } from "@/lib/api/types";
import { BOT_JOBS_LABEL, groupTabNote, jobGroup, jobsTabNote, type DeskTab, type JobsShow } from "@/lib/desk-tabs";
import type { TrayCard } from "@/lib/desk-tray";
import type { StaffDeskGroup } from "@/lib/staff";
import type { DeskNotes } from "@/lib/staff-desk";
import type { MastheadTab } from "@/components/templates/masthead-tabs";
import { DeskHeader } from "@/components/templates/desk-header";
import { BotJobs } from "@/components/admin/desk/bot-jobs";
import { DeskTools } from "@/components/admin/desk/desk-tools";
import { DeskView } from "@/components/admin/desk/desk-view";
import { RecentJobs } from "@/components/admin/desk/recent-jobs";

// How many of a tab's newest bot jobs sit beside its tools.
const RECENT = 3;

export interface StaffDeskProps {
  groups: StaffDeskGroup[];
  notes: DeskNotes;
  cards: TrayCard[];
  // Bot jobs' first page, newest first, and how it read.
  jobs: BotJob[];
  jobsMeta: CollectionMeta | null;
  jobsError: string | null;
  scope: "all" | "mine";
  pendingSuggestions: number | null;
  tab: DeskTab;
  show: JobsShow;
  now: Date;
}

// /admin, the Staff desk (design pick 2026-11-23): the page name on its
// rule, the in-tray of what's waiting, then a masthead tab per job group the
// viewer can use (its tools beside its recent bot jobs) and Bot jobs.
export function StaffDesk(p: StaffDeskProps) {
  const tabs: MastheadTab<DeskTab>[] = p.groups.map((group) => ({
    key: group.key,
    label: group.label,
    ...groupTabNote(group, p.notes, p, p.now),
    panel: (
      <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
        <DeskTools sections={group.sections} notes={p.notes} />
        <RecentJobs
          jobs={p.jobs.filter((j) => jobGroup(j.kind) === group.key).slice(0, RECENT)}
          group={group.label}
          showRequester={p.scope === "all"}
        />
      </div>
    ),
  }));
  tabs.push({
    key: "jobs",
    label: BOT_JOBS_LABEL,
    ...jobsTabNote(p.jobs),
    panel: (
      <BotJobs
        initialJobs={p.jobs}
        initialMeta={p.jobsMeta}
        initialError={p.jobsError}
        scope={p.scope}
        groups={p.groups.map((g) => ({ key: g.key, label: g.label }))}
      />
    ),
  });

  return (
    <div>
      <DeskHeader title="Staff desk" />
      <DeskView cards={p.cards} tabs={tabs} initialTab={p.tab} initialShow={p.show} />
    </div>
  );
}
