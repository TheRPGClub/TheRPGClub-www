"use client";

import type { BotJob } from "@/lib/api/types";
import {
  botJobFailureReason,
  botJobKindLabel,
  botJobPhase,
  botJobRequester,
  botJobSummaryLine,
  wireStamp,
} from "@/lib/bot-jobs";
import { useIsClient } from "@/hooks/use-is-client";
import { Stamp } from "@/components/admin/desk/stamp";
import { cn } from "@/lib/utils";

// One bot job as a slip: its time, what it did, and its Queued, Done or
// Failed stamp. A tool page that lists its own jobs uses it too. `wide`
// (the desk's Bot jobs tab) gives the stamp and who asked a column of their
// own on the right from `sm`.
export function WireSlip({ job, showRequester, wide = false }: { job: BotJob; showRequester: boolean; wide?: boolean }) {
  const isClient = useIsClient();
  const phase = botJobPhase(job.status);
  // The viewer's clock; the server doesn't know their zone, so the time
  // waits for hydration.
  const stamp = isClient ? wireStamp(job.created_at, new Date()) : null;
  const summary = botJobSummaryLine(job);
  const requester = showRequester ? botJobRequester(job) : null;
  const reason = phase === "failed" ? botJobFailureReason(job.error_message) || "The bot couldn't finish this." : null;
  const result = phase === "done" ? job.result_text?.trim() : null;
  const byLine = [
    requester,
    job.status === "queued" ? "the bot checks every 10 s" : null,
    job.status === "claimed" ? "the bot is on it" : null,
  ].filter(Boolean);

  return (
    <article
      className={cn(
        "grid grid-cols-[4.2rem_minmax(0,1fr)] gap-3.5 border-b border-border py-3",
        wide && "sm:grid-cols-[5rem_minmax(0,1fr)_10rem] sm:gap-4.5 sm:py-3.5",
      )}
    >
      <time
        dateTime={job.created_at}
        className={cn(
          "font-headline text-[1.6rem] text-dim-foreground",
          wide && "sm:text-[1.9rem]",
          phase === "queued" && "text-highlight",
        )}
      >
        {stamp?.clock ?? "--:--"}
        <small className="font-label mt-1 block text-[0.7rem] tracking-[0.08em] text-faint-foreground">
          {stamp?.day ?? " "}
        </small>
      </time>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2.5">
          <h3 className="font-semibold">{botJobKindLabel(job.kind)}</h3>
          <Stamp phase={phase} className={wide ? "sm:hidden" : undefined} />
        </div>
        {summary && <p className="break-words">{summary}</p>}
        {byLine.length > 0 && (
          <p className={cn("text-[0.82rem] text-faint-foreground", wide && "sm:hidden")}>{byLine.join(" · ")}</p>
        )}
        {reason && <BotSaid tone="bad">{reason}</BotSaid>}
        {result && <BotSaid tone="plain">{result}</BotSaid>}
      </div>
      {wide && (
        <div className="hidden flex-col items-end gap-2 text-right text-[0.82rem] text-faint-foreground sm:flex">
          <Stamp phase={phase} />
          {byLine.join(" · ")}
        </div>
      )}
    </article>
  );
}

// The bot's own words, quoted under a dashed rule: its error in signal
// orange, or what it reported when done.
function BotSaid({ tone, children }: { tone: "bad" | "plain"; children: string }) {
  return (
    <blockquote
      className={cn(
        "mt-2 border-t border-dashed pt-2 text-[0.92rem] leading-[1.4] break-words italic",
        tone === "bad" ? "border-destructive/50 text-destructive" : "border-border-strong text-dim-foreground",
      )}
    >
      <cite className="font-label mb-0.5 block text-[0.7rem] tracking-[0.08em] text-faint-foreground not-italic">
        The bot said
      </cite>
      &ldquo;{children}&rdquo;
    </blockquote>
  );
}
