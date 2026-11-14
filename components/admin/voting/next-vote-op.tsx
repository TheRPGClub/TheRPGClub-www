"use client";

import { useState, useTransition } from "react";
import { CalendarClock } from "lucide-react";
import { rescheduleVoteAction } from "@/app/actions/voting-console";
import type { VotingRound } from "@/lib/api/types";
import { CLUB_TIME_ZONE, localInputToOffsetIso, toLocalInputValue } from "@/lib/public-reminders";
import { clubClock, dayAndClock, nextVoteRefusal } from "@/lib/voting-console";
import { Button } from "@/components/ui/button";
import { NextVoteField } from "./next-vote-field";
import { Op, OpText } from "./voting-ops";

// The Next vote card: while nominating, the draft time the ruler's pin and
// the date field share, saved only on "Set next vote"; after that, why it
// can't move.
export function NextVoteOp({
  round,
  now,
  draft,
  setDraft,
  fieldOpen,
  setFieldOpen,
  isClient,
}: {
  round: VotingRound;
  now: number;
  draft: number;
  setDraft: (at: number) => void;
  fieldOpen: boolean;
  setFieldOpen: (open: boolean) => void;
  isClient: boolean;
}) {
  const saved = Date.parse(round.voting_opens_at);
  const movable = round.phase === "nominating";
  const changed = movable && draft !== saved;
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const when = (at: number) =>
    isClient ? `${dayAndClock(at)} your time, ${clubClock(at, CLUB_TIME_ZONE)} club time.` : "";

  const save = () => {
    setError(null);
    setNotice(null);
    const refusal = nextVoteRefusal(round, draft, Date.now());
    if (refusal) {
      setError(refusal);
      return;
    }
    const iso = new Date(draft).toISOString();
    startTransition(async () => {
      const result = await rescheduleVoteAction(round.round_number, iso);
      if (!result.ok || !result.data) {
        setError(result.error ?? "Couldn't move the vote.");
        return;
      }
      setFieldOpen(false);
      setNotice(`Saved. Voting closes ${when(Date.parse(result.data.voting_closes_at))}`);
    });
  };

  if (!movable) {
    return (
      <Op icon={CalendarClock} title="Next vote">
        <OpText>{nextVoteRefusal(round, null, now)}</OpText>
      </Op>
    );
  }

  return (
    <Op icon={CalendarClock} title="Next vote">
      <OpText>
        <span className={changed ? "text-highlight" : undefined}>{when(draft)}</span>
        {changed && <> Was {isClient ? dayAndClock(saved) : ""}.</>}
      </OpText>
      {fieldOpen && (
        <NextVoteField
          value={isClient ? toLocalInputValue(new Date(draft).toISOString()) : ""}
          onChange={(value) => {
            const iso = localInputToOffsetIso(value);
            if (iso) setDraft(Date.parse(iso));
          }}
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {changed ? (
          <>
            <Button type="button" variant="highlight" size="sm" disabled={pending} onClick={save}>
              {pending ? "Saving..." : "Set next vote"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => {
                setDraft(saved);
                setError(null);
              }}
            >
              Undo
            </Button>
          </>
        ) : (
          !fieldOpen && (
            <Button type="button" variant="outline" size="sm" onClick={() => setFieldOpen(true)}>
              Change date
            </Button>
          )
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && !changed && (
        <p role="status" className="mt-2 text-[0.84rem] text-dim-foreground">
          {notice}
        </p>
      )}
    </Op>
  );
}
