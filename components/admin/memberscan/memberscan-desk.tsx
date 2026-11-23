"use client";

import { useState, useTransition } from "react";
import { Play } from "lucide-react";
import { startMemberscanAction } from "@/app/actions/superadmin-tools";
import type { BotJob } from "@/lib/api/types";
import { agoText, BOT_JOB_LONG_REFRESH_DELAYS_MS, isBotJobSettled } from "@/lib/bot-jobs";
import { useIsClient } from "@/hooks/use-is-client";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { WireSlip } from "@/components/admin/desk/wire-slip";
import { CountSheet } from "@/components/admin/memberscan/count-sheet";
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
    // On a phone the sheet sits right under the button; from lg it is the
    // right column beside both the button and the earlier scans.
    <div className="mt-6 grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_30rem] lg:grid-rows-[auto_1fr]">
      <div className="min-w-0 lg:col-start-1">
        <p className="max-w-[60ch] text-dim-foreground">
          The bot reads every member of the server, updates each one&rsquo;s profile and roles, and
          marks members who have left as departed. It takes a few minutes on a big server; the
          counts land on the sheet when it is done.
        </p>
        {waiting && (
          <p className="mt-3 text-[0.9rem] text-foreground">
            A recount is already waiting for the bot. Starting another queues a second one.
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="highlight" onClick={start} disabled={pending}>
            <Play data-icon="inline-start" />
            {pending ? "Starting..." : started ? "Start another recount" : "Start a recount"}
          </Button>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        {started ? (
          <ProofCard
            jobId={started.id}
            initialJob={started}
            refreshDelays={BOT_JOB_LONG_REFRESH_DELAYS_MS}
            what="The recount"
            overhang
          >
            {(job) => <CountSheet job={job} heading={`Recount #${started.id}`} />}
          </ProofCard>
        ) : (
          <ProofCard
            overhang
            caption={
              lastDone
                ? `Counts from the last recount${
                    isClient
                      ? `, ${agoText(lastDone.finished_at ?? lastDone.updated_at, new Date())}`
                      : ""
                  }.`
                : "No finished recount yet."
            }
          >
            <CountSheet
              job={lastDone}
              heading={lastDone ? `Recount #${lastDone.id}` : "No recount yet"}
            />
          </ProofCard>
        )}
      </div>

      <section aria-labelledby="memberscan-earlier" className="min-w-0 lg:col-start-1">
        <h2
          id="memberscan-earlier"
          className="font-label border-b-2 border-foreground pb-1.5 text-[1.05rem] tracking-[0.06em]"
        >
          Earlier recounts
        </h2>
        {earlier.length === 0 ? (
          <p className="py-3 text-sm text-dim-foreground">No recounts yet.</p>
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
  );
}
