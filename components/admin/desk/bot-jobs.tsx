"use client";

import { useState } from "react";
import { ChevronDown, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { BotJob, CollectionMeta } from "@/lib/api/types";
import { showsJob } from "@/lib/desk-tabs";
import type { StaffGroup } from "@/lib/staff";
import { useWire } from "@/hooks/use-wire";
import { useDesk } from "@/components/admin/desk/desk-context";
import { BotJobsFilter } from "@/components/admin/desk/bot-jobs-filter";
import { WireSlip } from "@/components/admin/desk/wire-slip";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// The desk's Bot jobs tab: bot jobs newest first, each a slip with its time,
// what it did, its Queued, Done or Failed stamp and who asked. Admins and
// Superadmins see every job (`scope="all"`); Moderators only their own.
// The filter sits in a 15.5rem column on the left from `lg` and folds into
// a "Show" disclosure above the list below it. It narrows the jobs read so
// far; "Older jobs" reads the next page. While a job is still queued the
// list re-reads itself a few times. No retry: a failed job stays failed.
export function BotJobs({
  initialJobs,
  initialMeta,
  initialError,
  scope,
  groups,
}: {
  initialJobs: BotJob[];
  initialMeta: CollectionMeta | null;
  // Set when the first page couldn't be read.
  initialError?: string | null;
  scope: "all" | "mine";
  groups: { key: StaffGroup; label: string }[];
}) {
  const { jobs, next, error, loading, refreshing, refresh, loadOlder } = useWire(initialJobs, initialMeta, initialError);
  const { show, setShow } = useDesk();
  const [from, setFrom] = useState<StaffGroup | null>(null);
  const shown = jobs.filter((j) => showsJob(j, show, from));
  const filter = <BotJobsFilter jobs={jobs} groups={groups} show={show} from={from} onShow={setShow} onFrom={setFrom} />;

  return (
    <div data-slot="bot-jobs" className="grid items-start gap-6 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-12">
      <aside className="hidden lg:block">{filter}</aside>
      <Collapsible className="lg:hidden">
        <CollapsibleTrigger render={<Button type="button" variant="outline" />} className="group/filter cursor-pointer">
          <SlidersHorizontal aria-hidden className="size-4" />
          Show
          <ChevronDown
            aria-hidden
            className="size-4 motion-safe:transition-transform group-data-panel-open/filter:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 max-w-md">{filter}</CollapsibleContent>
      </Collapsible>

      <section aria-labelledby="bot-jobs-heading" className="min-w-0">
        <div data-slot="desk-rule-head" className="flex items-baseline gap-3 border-b-2 border-foreground pb-2">
          <h2 id="bot-jobs-heading" className="font-headline text-[1.9rem]">
            {scope === "all" ? "Everyone's jobs" : "Your jobs"}
          </h2>
          <Button
            type="button"
            variant="row"
            size="icon-sm"
            className="ml-auto self-center"
            onClick={refresh}
            disabled={refreshing}
            aria-label="Refresh bot jobs"
            title="Refresh bot jobs"
          >
            <RefreshCw className={refreshing ? "motion-safe:animate-spin" : undefined} />
          </Button>
        </div>
        {error && (
          <p role="alert" className="py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {shown.length === 0 && !error ? (
          <p className="py-4 text-sm text-dim-foreground">
            {jobs.length > 0
              ? "No bot jobs like that among those read. Older jobs may have some."
              : scope === "all"
                ? "No bot jobs yet. A job lands here when a tool asks the bot to do something in Discord."
                : "None of your bot jobs yet. A job lands here when a tool you use asks the bot to do something in Discord."}
          </p>
        ) : (
          <ol data-slot="bot-jobs-list">
            {shown.map((job) => (
              <li key={job.id}>
                <WireSlip job={job} showRequester={scope === "all"} wide />
              </li>
            ))}
          </ol>
        )}
        {next != null && (
          <Button type="button" variant="outline" size="sm" className="mt-4" disabled={loading} onClick={loadOlder}>
            {loading ? "Loading..." : "Older jobs"}
          </Button>
        )}
      </section>
    </div>
  );
}
