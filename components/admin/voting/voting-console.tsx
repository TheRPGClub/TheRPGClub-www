"use client";

import { useState } from "react";
import type { BotJob, VotingRound } from "@/lib/api/types";
import { latestJobFor, roundStatusLine, rulerScale, rulerTicks, rulerTime, shortDay, totalVotes } from "@/lib/voting-console";
import { useIsClient } from "@/hooks/use-is-client";
import { DateRuler } from "./date-ruler";
import { NextVoteOp } from "./next-vote-op";
import { TallyTrack, type TrackView } from "./tally-track";
import { PublishOp, RepostOp } from "./voting-job-ops";
import { CloseNowOp } from "./voting-ops";
import { STAFF_DESK_BACK } from "@/lib/staff";
import { BackLink } from "@/components/shell/back-link";

export type ConsoleTrack = TrackView;

// The voting console (admin-c-3): the round numeral and status, the date
// ruler with its Next vote pin, both private tallies, and the operations.
// The pin and the Next vote card share one draft, so a drag, the arrow keys
// or the date field all set the same time, saved only on "Set next vote".
export function VotingConsole({
  round,
  nominationsOpenedAt,
  tracks,
  jobs,
  now,
}: {
  round: VotingRound;
  nominationsOpenedAt: string | null;
  tracks: TrackView[];
  jobs: BotJob[];
  now: number;
}) {
  const isClient = useIsClient();
  const n = round.round_number;
  const saved = Date.parse(round.voting_opens_at);
  const movable = round.phase === "nominating";
  const [draft, setDraft] = useState<number>(saved);
  const [fieldOpen, setFieldOpen] = useState(false);
  const votes = tracks.every((t) => t.readable) ? tracks.reduce((s, t) => s + totalVotes(t.lines), 0) : null;
  const tieJob = latestJobFor(jobs, "voting_tie_broken", n);

  // The ruler: every known point of the round as saved, and room to drag
  // the pin. It doesn't follow the draft, so the pin's limits hold still.
  const points = [
    nominationsOpenedAt ? Date.parse(nominationsOpenedAt) : NaN,
    saved,
    Date.parse(round.closed_at ?? round.voting_closes_at),
    round.runoff_closes_at ? Date.parse(round.runoff_closes_at) : NaN,
    round.decided_at ? Date.parse(round.decided_at) : NaN,
  ];
  const scale = rulerScale(points, now, movable, saved);
  const ticks = isClient ? rulerTicks(round, nominationsOpenedAt, now, movable && draft === saved) : [];
  const pinMax = Math.max(saved, rulerTime(96, scale));

  return (
    <div data-slot="issue-desk" data-variant="voting-console" className="flex flex-col">
      <BackLink {...STAFF_DESK_BACK} />
      <header className="grid items-end gap-x-7 gap-y-1.5 border-b-2 border-foreground pb-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <p aria-hidden className="font-headline text-[5.5rem] leading-[0.8] md:text-[8rem]">
          {n}
        </p>
        <div className="min-w-0">
          <h1 className="font-headline text-[2.6rem] leading-[0.9] md:text-[3.75rem]">Voting console</h1>
          <p className="font-label mt-1.5 text-base tracking-[0.08em] text-dim-foreground">
            {roundStatusLine(round, votes, now)}
          </p>
        </div>
      </header>

      <div className="mt-6.5 hidden md:block">
        {isClient ? (
          <DateRuler
            scale={scale}
            ticks={ticks}
            now={now}
            pin={
              movable
                ? {
                    at: draft,
                    min: now,
                    max: pinMax,
                    label: shortDay(draft),
                    caption: "Next vote",
                    onChange: setDraft,
                    onTypeDate: () => {
                      setFieldOpen(true);
                      window.setTimeout(() => document.getElementById("next-vote-field")?.focus(), 0);
                    },
                  }
                : null
            }
            ghost={movable ? null : { label: "Next vote", caption: `After Round ${n}` }}
          />
        ) : (
          <div className="h-[92px]" />
        )}
      </div>

      <div className="mt-5.5 grid items-start gap-8 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_22rem]">
        {tracks.map((track) => (
          <TallyTrack key={track.category} round={round} track={track} tieJob={tieJob} />
        ))}
        <aside aria-label="Round operations" className="grid gap-2.5 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
          <CloseNowOp round={round} />
          <PublishOp round={round} job={latestJobFor(jobs, "voting_results_publish", n)} />
          <RepostOp round={round} job={latestJobFor(jobs, "voting_panels_repost", n)} />
          <NextVoteOp
            round={round}
            now={now}
            draft={draft}
            setDraft={setDraft}
            fieldOpen={fieldOpen}
            setFieldOpen={setFieldOpen}
            isClient={isClient}
          />
        </aside>
      </div>
    </div>
  );
}
