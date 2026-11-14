"use client";

import { useState, useTransition } from "react";
import { Megaphone, RefreshCw } from "lucide-react";
import { publishResultsAction, repostPanelsAction } from "@/app/actions/voting-console";
import type { BotJob, VotingRound } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { JobLine } from "./job-line";
import { Op, OpNote, OpText } from "./voting-ops";

// Publish and repost: a button that queues the bot's job, then that job's
// status; before any click, the newest such job for this round.
function useJobAction(run: () => Promise<{ ok: boolean; data?: BotJob; error?: string }>) {
  const [fresh, setFresh] = useState<BotJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const go = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await run();
        if (result.ok && result.data) setFresh(result.data);
        else setError(result.error ?? "Couldn't queue it.");
      } catch {
        setError("Couldn't reach the club's server. Try again.");
      }
    });
  };
  return { fresh, error, pending, go };
}

export function PublishOp({ round, job }: { round: VotingRound; job: BotJob | null }) {
  const n = round.round_number;
  const { fresh, error, pending, go } = useJobAction(() => publishResultsAction(n));
  return (
    <Op icon={Megaphone} title="Publish results">
      <OpText>Results post in #announcements and the winner threads open.</OpText>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button type="button" variant="highlight" size="sm" disabled={!round.voting_ended || pending} onClick={go}>
          {pending ? "Queueing..." : job || fresh ? "Publish again" : "Publish"}
        </Button>
        {!round.voting_ended && <OpNote>After voting closes</OpNote>}
        {!fresh && <JobLine job={job} what="The results post" />}
      </div>
      {fresh && <JobLine job={null} fresh={fresh} what="The results post" />}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </Op>
  );
}

export function RepostOp({ round, job }: { round: VotingRound; job: BotJob | null }) {
  const { fresh, error, pending, go } = useJobAction(() => repostPanelsAction());
  return (
    <Op icon={RefreshCw} title="Repost voting panels">
      <OpText>If the ballots went missing from Discord.</OpText>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button type="button" variant="outline" size="sm" disabled={!round.voting_open || pending} onClick={go}>
          {pending ? "Queueing..." : "Repost"}
        </Button>
        {!round.voting_open && <OpNote>While voting is open</OpNote>}
        {!fresh && <JobLine job={job} what="The repost" />}
      </div>
      {fresh && <JobLine job={null} fresh={fresh} what="The repost" />}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </Op>
  );
}
