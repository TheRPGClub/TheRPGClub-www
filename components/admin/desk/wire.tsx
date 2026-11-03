"use client";

import { useEffect, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { listBotJobsAction } from "@/app/actions/bot-jobs";
import type { BotJob, CollectionMeta } from "@/lib/api/types";
import {
  BOT_JOB_REFRESH_DELAYS_MS,
  botJobFailureReason,
  botJobKindLabel,
  botJobPhase,
  botJobRequester,
  botJobSummaryLine,
  isBotJobSettled,
  wireStamp,
} from "@/lib/bot-jobs";
import { useIsClient } from "@/hooks/use-is-client";
import { Stamp } from "@/components/admin/desk/stamp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Page 1 re-read, with older pages the viewer loaded kept below it.
function mergeFirstPage(fresh: BotJob[], current: BotJob[]): BotJob[] {
  const ids = new Set(fresh.map((j) => j.id));
  const oldest = fresh.at(-1)?.id ?? Infinity;
  return [...fresh, ...current.filter((j) => !ids.has(j.id) && j.id < oldest)];
}

// The wire: bot jobs newest first, each a slip with its time, what it did,
// and its Queued, Done or Failed stamp. Admins and Superadmins see every
// job (`scope="all"`, with who asked); Moderators only their own. While a
// job on it is still queued it re-reads itself a few times; "Older jobs"
// loads the next page. No retry: a failed job stays failed.
export function Wire({
  initialJobs,
  initialMeta,
  scope,
  initialError,
  className,
}: {
  initialJobs: BotJob[];
  initialMeta: CollectionMeta | null;
  scope: "all" | "mine";
  // Set when the first page couldn't be read.
  initialError?: string | null;
  className?: string;
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [next, setNext] = useState<number | null>(initialMeta?.next ?? null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, startLoading] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const waiting = jobs.some((j) => !isBotJobSettled(j));
  // Bumped by each automatic re-read, so the run walks the delays once.
  const [step, setStep] = useState(0);

  const refresh = (manual: boolean) =>
    startRefresh(async () => {
      const result = await listBotJobsAction(1).catch(() => null);
      if (!result?.ok || !result.data) {
        setError(result?.error ?? "Lost touch with the club's server.");
        return;
      }
      setError(null);
      const fresh = result.data;
      setJobs((current) => mergeFirstPage(fresh, current));
      if (manual) setStep(0);
      else setStep((s) => s + 1);
    });

  useEffect(() => {
    if (!waiting || step >= BOT_JOB_REFRESH_DELAYS_MS.length) return;
    const timer = window.setTimeout(() => refresh(false), BOT_JOB_REFRESH_DELAYS_MS[step]);
    return () => window.clearTimeout(timer);
  }, [waiting, step]);

  const loadOlder = () => {
    if (next == null) return;
    startLoading(async () => {
      const result = await listBotJobsAction(next).catch(() => null);
      if (!result?.ok || !result.data) {
        setError(result?.error ?? "Lost touch with the club's server.");
        return;
      }
      const older = result.data;
      setJobs((current) => {
        const ids = new Set(current.map((j) => j.id));
        return [...current, ...older.filter((j) => !ids.has(j.id))];
      });
      setNext(result.meta?.next ?? null);
    });
  };

  return (
    <aside aria-labelledby="wire-heading" className={className}>
      <div className="flex items-baseline gap-3 border-b-2 border-paper pb-2">
        <h2 id="wire-heading" className="font-headline text-[1.9rem]">
          The wire
        </h2>
        <span className="font-label text-[0.85rem] tracking-[0.08em] text-paper-mute">
          {scope === "all" ? "Every bot job" : "Your bot jobs"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="ml-auto self-center text-paper-dim"
          onClick={() => refresh(true)}
          disabled={refreshing}
          aria-label="Refresh the wire"
          title="Refresh the wire"
        >
          <RefreshCw className={refreshing ? "motion-safe:animate-spin" : undefined} />
        </Button>
      </div>

      {error && (
        <p role="alert" className="py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {jobs.length === 0 && !error ? (
        <p className="py-4 text-sm text-paper-dim">
          {scope === "all"
            ? "Nothing on the wire yet. A job lands here when a tool asks the bot to do something in Discord."
            : "None of your bot jobs yet. A job lands here when a tool you use asks the bot to do something in Discord."}
        </p>
      ) : (
        <ol>
          {jobs.map((job) => (
            <li key={job.id}>
              <WireSlip job={job} showRequester={scope === "all"} />
            </li>
          ))}
        </ol>
      )}

      {next != null && (
        <Button type="button" variant="outline" size="sm" className="mt-4" disabled={loading} onClick={loadOlder}>
          {loading ? "Loading..." : "Older jobs"}
        </Button>
      )}
    </aside>
  );
}

// One bot job as a slip on the wire. Exported for a tool page that lists its
// own jobs in the same style.
export function WireSlip({ job, showRequester }: { job: BotJob; showRequester: boolean }) {
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
    <article className="grid grid-cols-[4.2rem_minmax(0,1fr)] gap-3.5 border-b border-rule py-3">
      <time
        dateTime={job.created_at}
        className={cn(
          "font-headline text-[1.6rem] text-paper-dim",
          phase === "queued" && "text-highlight",
        )}
      >
        {stamp?.clock ?? "--:--"}
        <small className="font-label mt-1 block text-[0.7rem] tracking-[0.08em] text-paper-mute">
          {stamp?.day ?? " "}
        </small>
      </time>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2.5">
          <h3 className="font-semibold">{botJobKindLabel(job.kind)}</h3>
          <Stamp phase={phase} />
        </div>
        {summary && <p className="break-words">{summary}</p>}
        {byLine.length > 0 && (
          <p className="text-[0.82rem] text-paper-mute">{byLine.join(" · ")}</p>
        )}
        {reason && <BotSaid tone="bad">{reason}</BotSaid>}
        {result && <BotSaid tone="plain">{result}</BotSaid>}
      </div>
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
        tone === "bad" ? "border-destructive/50 text-destructive" : "border-rule-strong text-paper-dim",
      )}
    >
      <cite className="font-label mb-0.5 block text-[0.7rem] tracking-[0.08em] text-paper-mute not-italic">
        The bot said
      </cite>
      &ldquo;{children}&rdquo;
    </blockquote>
  );
}
