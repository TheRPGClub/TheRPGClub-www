"use client";

import { useState, useTransition } from "react";
import { Play } from "lucide-react";
import { startMemberscanAction } from "@/app/actions/superadmin-tools";
import type { BotJob } from "@/lib/api/types";
import { agoText, isBotJobSettled } from "@/lib/bot-jobs";
import { parseMemberScanCounts } from "@/lib/memberscan";
import { useIsClient } from "@/hooks/use-is-client";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { WireSlip } from "@/components/admin/desk/wire";
import { Button } from "@/components/ui/button";

// /admin/memberscan: start a scan, and read its counts on the sheet beside
// the button once the bot reports them. Earlier scans from the wire sit
// under the button.
export function MemberscanDesk({ recent }: { recent: BotJob[] }) {
  const [started, setStarted] = useState<BotJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isClient = useIsClient();
  const lastDone = recent.find((j) => j.status === "done") ?? null;
  const earlier = recent.filter((j) => j.id !== started?.id);
  // Another scan queued before this page loaded and still waiting.
  const waiting = !started && recent.some((j) => !isBotJobSettled(j));

  const start = () => {
    setError(null);
    startTransition(async () => {
      const result = await startMemberscanAction().catch(() => null);
      if (!result?.ok || !result.job) {
        setError(result?.error ?? "Lost touch with the club's server. Try again.");
        return;
      }
      setStarted(result.job);
    });
  };

  return (
    <div className="mt-6 grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <div className="min-w-0">
        <p className="max-w-[60ch] text-paper-dim">
          The bot reads every member of the server, updates each one&rsquo;s profile and roles,
          and marks members who have left as departed. It takes a few minutes on a big server;
          the counts land on the sheet when it is done.
        </p>
        {waiting && (
          <p className="mt-3 text-[0.9rem] text-highlight">
            A scan is already waiting for the bot. Starting another queues a second one.
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="highlight" onClick={start} disabled={pending}>
            <Play data-icon="inline-start" />
            {pending ? "Starting..." : started ? "Start another scan" : "Start memberscan"}
          </Button>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <section aria-labelledby="memberscan-earlier" className="mt-9">
          <h2
            id="memberscan-earlier"
            className="font-label border-b-2 border-paper pb-1.5 text-[1.05rem] tracking-[0.06em]"
          >
            Earlier scans
          </h2>
          {earlier.length === 0 ? (
            <p className="py-3 text-sm text-paper-dim">No scans on the wire yet.</p>
          ) : (
            <ol>
              {earlier.map((job) => (
                <li key={job.id}>
                  <WireSlip job={job} showRequester />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {started ? (
        <ProofCard jobId={started.id} initialJob={started} what="The scan" overhang>
          {(job) => <CountSheet job={job} heading={`Scan #${started.id}`} />}
        </ProofCard>
      ) : (
        <ProofCard
          overhang
          caption={
            lastDone
              ? `Counts from the last scan${
                  isClient ? `, ${agoText(lastDone.finished_at ?? lastDone.updated_at, new Date())}` : ""
                }.`
              : "No finished scan yet."
          }
        >
          <CountSheet job={lastDone} heading={lastDone ? `Scan #${lastDone.id}` : "No scan yet"} />
        </ProofCard>
      )}
    </div>
  );
}

// The scan's three counts in Anton, as the bot reported them; dashes until
// the job is done. A result text without the counts is shown as it is.
function CountSheet({ job, heading }: { job: BotJob | null; heading: string }) {
  const done = job?.status === "done";
  const counts = done ? parseMemberScanCounts(job.result_text) : null;
  const cells = [
    { label: "Updated", value: counts?.updated },
    { label: "Failed", value: counts?.failed },
    { label: "Departed", value: counts?.departed },
  ];
  return (
    <div className="bg-ink-2 p-5">
      <p className="font-label text-[0.85rem] tracking-[0.08em] text-paper-dim">{heading}</p>
      <dl className="mt-4 grid grid-cols-3 border-t border-rule">
        {cells.map((cell, i) => (
          <div key={cell.label} className={i > 0 ? "border-l border-rule pt-3 pl-4" : "pt-3 pr-4"}>
            <dt className="font-label text-[0.78rem] tracking-[0.06em] text-paper-mute">{cell.label}</dt>
            <dd className="font-headline mt-1 text-[2.6rem] leading-[0.9] tabular-nums">
              {cell.value ?? "--"}
            </dd>
          </div>
        ))}
      </dl>
      {done && !counts && job.result_text && (
        <p className="mt-4 border-t border-dashed border-rule-strong pt-3 text-[0.92rem] text-paper-dim italic">
          &ldquo;{job.result_text}&rdquo;
        </p>
      )}
    </div>
  );
}
