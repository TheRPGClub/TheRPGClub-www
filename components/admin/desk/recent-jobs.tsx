"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BotJob } from "@/lib/api/types";
import { useDesk } from "@/components/admin/desk/desk-context";
import { WireSlip } from "@/components/admin/desk/wire-slip";

// Beside a desk tab's tools: the newest few bot jobs its tools queued, and
// the way to all of them (Bot jobs, opened in place).
export function RecentJobs({ jobs, group, showRequester }: { jobs: BotJob[]; group: string; showRequester: boolean }) {
  const { openJobs } = useDesk();
  return (
    <aside aria-label={`Recent bot jobs: ${group}`} className="min-w-0">
      <div className="flex items-baseline gap-3 border-b-2 border-foreground pb-2">
        <h2 className="font-headline text-[1.45rem]">Recent bot jobs</h2>
        <span className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">{group}</span>
      </div>
      {jobs.length === 0 ? (
        <p className="border-b border-border py-3.5 text-sm text-faint-foreground">No bot jobs from these tools lately.</p>
      ) : (
        <ol>
          {jobs.map((job) => (
            <li key={job.id}>
              <WireSlip job={job} showRequester={showRequester} />
            </li>
          ))}
        </ol>
      )}
      <Link
        href="/admin?tab=jobs"
        onClick={(e) => {
          e.preventDefault();
          openJobs();
        }}
        className="font-label mt-3.5 inline-flex items-center gap-1.5 rounded-xs text-[0.84rem] font-extrabold tracking-[0.06em] text-dim-foreground transition-colors outline-none hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
      >
        All bot jobs
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </aside>
  );
}
