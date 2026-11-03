"use client";

import type { BotJob } from "@/lib/api/types";
import { botJobFailureReason, botJobPhase, wireStamp } from "@/lib/bot-jobs";
import { useIsClient } from "@/hooks/use-is-client";
import { BotJobStatus } from "@/components/bot-job-status";
import { cn } from "@/lib/utils";

const DOT = {
  queued: "bg-highlight shadow-[0_0_0_3px_rgb(255_212_0/0.18)]",
  done: "bg-ok",
  failed: "bg-destructive",
} as const;

const WORD = { queued: "Queued", done: "Done", failed: "Failed" } as const;

// An operation's job on the console: the one just queued from here follows
// itself to Done or Failed (the Wave 1 status line); otherwise the newest
// one on the wire for this round reads as a dot, its outcome and the time
// ("Done 21:05"), with the bot's reason when it failed.
export function JobLine({
  job,
  fresh,
  what,
}: {
  job: BotJob | null;
  // The job this page just queued: follow it.
  fresh?: BotJob | null;
  what: string;
}) {
  const isClient = useIsClient();
  if (fresh) return <BotJobStatus jobId={fresh.id} initialJob={fresh} what={what} className="mt-2.5" />;
  if (!job) return null;
  const phase = botJobPhase(job.status);
  const at = job.finished_at ?? job.created_at;
  const stamp = isClient ? wireStamp(at, new Date()) : null;
  const reason = phase === "failed" ? botJobFailureReason(job.error_message) : "";
  return (
    <div className="min-w-0">
      <p className="font-label inline-flex items-center gap-[7px] text-[0.8rem] tracking-[0.06em] text-paper-dim">
        <i aria-hidden className={cn("size-2 rounded-full", DOT[phase])} />
        {WORD[phase]}
        {stamp && (
          <span>
            {stamp.day === "Today" ? "" : `${stamp.day} `}
            {stamp.clock}
          </span>
        )}
      </p>
      {reason && <p className="mt-1 text-[0.82rem] leading-snug text-destructive">{reason}</p>}
    </div>
  );
}
