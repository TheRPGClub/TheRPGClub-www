"use client";

import { useState, useTransition } from "react";
import { Scale } from "lucide-react";
import { resolveGotyTieAction } from "@/app/actions/goty-desk";
import type { GotyAward } from "@/lib/api/goty";
import { GOTY_AWARD_SHORT, tieChoices } from "@/lib/goty-desk";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// An Award a runoff left tied, as the voting console's tie break: the
// admin picks the one winner (an Award has one, unlike a GOTM round). The
// bot announces the results once the vote is decided.
export function GotyTieBreak({ year, award }: { year: number; award: GotyAward }) {
  const label = GOTY_AWARD_SHORT[award.award];
  const choices = tieChoices(award);
  const [picked, setPicked] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hadRunoff = award.runoff_ballot.length > 0;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await resolveGotyTieAction(year, award.award, Number(picked));
      if (!result.ok) setError(result.error ?? "Couldn't settle the tie.");
    });
  };

  return (
    <fieldset className="rounded-md bg-card px-3.5 pt-1 pb-3.5 ring-1 ring-highlight ring-inset">
      <legend className="sr-only">{label} tie break</legend>
      <p className="font-label flex items-center gap-2 pt-2.5 text-[0.95rem] font-extrabold tracking-[0.06em]">
        <Scale aria-hidden className="size-4" />
        {label} tie break
      </p>
      <p className="mt-1 mb-2.5 text-[0.84rem] leading-snug text-dim-foreground">
        {hadRunoff ? "The runoff tied again. " : "The vote closed tied. "}
        Pick the winner. The bot announces the results once every Award is settled.
      </p>
      <RadioGroup value={picked} onValueChange={(v) => setPicked(String(v))} aria-label={`${label} winner`} className="gap-1.5">
        {choices.map((c) => (
          <Label key={c.gameId} variant="option" className="flex cursor-pointer items-center gap-2.5 px-1 py-1">
            <RadioGroupItem value={String(c.gameId)} />
            <span className="min-w-0 flex-1 font-semibold break-words">{c.title}</span>
            {c.votes !== null && (
              <span className="font-label text-[0.8rem] tracking-[0.06em] text-faint-foreground">
                {c.votes} {c.votes === 1 ? "vote" : "votes"}
              </span>
            )}
          </Label>
        ))}
      </RadioGroup>
      <div className="mt-3">
        <Button type="button" variant="highlight" size="sm" disabled={!picked || pending} onClick={submit}>
          {pending ? "Working..." : "Pick the winner"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
