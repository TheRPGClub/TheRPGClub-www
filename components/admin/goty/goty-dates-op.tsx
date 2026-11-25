"use client";

import { useState, useTransition } from "react";
import { CalendarClock } from "lucide-react";
import { moveGotyDatesAction } from "@/app/actions/goty-desk";
import type { GotyVote } from "@/lib/api/goty";
import {
  changedDates,
  datesNote,
  datesRefusal,
  GOTY_DATE_KEYS,
  movableDates,
  savedDates,
  type GotyDates,
} from "@/lib/goty-desk";
import { CLUB_TIME_ZONE } from "@/lib/public-reminders";
import { dayAndClock } from "@/lib/voting-console";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "@/components/ui/button";
import { Op, OpText } from "@/components/admin/voting/voting-ops";
import { GotyDateField } from "./goty-date-field";

// The Dates card: the GOTY Vote's three movable dates as plain fields in
// the viewer's zone, saved together. Only the dates the API still lets move
// are open (api#474: nominations' opening until nominations open, the close
// until the main vote is tallied); moving the vote's opening alone lets the
// close follow to the end of that weekend.
export function GotyDatesOp({ vote, now }: { vote: GotyVote; now: number }) {
  const isClient = useIsClient();
  const saved = savedDates(vote);
  const movable = movableDates(vote, now);
  const [draft, setDraft] = useState<GotyDates>(saved);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const changed = Object.keys(changedDates(saved, draft)).length > 0;

  const save = () => {
    setError(null);
    setNotice(null);
    const refusal = datesRefusal(saved, draft);
    if (refusal) return setError(refusal);
    const moves = Object.fromEntries(
      Object.entries(changedDates(saved, draft)).map(([k, at]) => [k, new Date(at).toISOString()]),
    );
    startTransition(async () => {
      const result = await moveGotyDatesAction(vote.year, moves);
      if (!result.ok || !result.data) return setError(result.error ?? "Couldn't move the dates.");
      setDraft(savedDates(result.data));
      const close = Date.parse(result.data.voting_closes_at);
      setNotice(`Saved. Voting closes ${dayAndClock(close)} your time, ${dayAndClock(close, CLUB_TIME_ZONE)} club time.`);
    });
  };

  return (
    <Op icon={CalendarClock} title="Dates">
      <OpText>{datesNote(vote, now)}</OpText>
      <div className="space-y-2.5">
        {GOTY_DATE_KEYS.map((key) => (
          <GotyDateField
            key={key}
            field={key}
            at={draft[key]}
            saved={saved[key]}
            disabled={!movable.has(key) || pending}
            isClient={isClient}
            onChange={(at) => setDraft((d) => ({ ...d, [key]: at }))}
          />
        ))}
      </div>
      {movable.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="highlight" size="sm" disabled={!changed || pending} onClick={save}>
            {pending ? "Saving..." : "Save dates"}
          </Button>
          {changed && (
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => (setDraft(saved), setError(null))}>
              Undo
            </Button>
          )}
        </div>
      )}
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
