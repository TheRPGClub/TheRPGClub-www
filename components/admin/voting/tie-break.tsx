"use client";

import { useState, useTransition } from "react";
import { Scale } from "lucide-react";
import { resolveTieAction } from "@/app/actions/voting-console";
import type { BotJob, Game, VotingCategory, VotingRound } from "@/lib/api/types";
import { CATEGORY_SHORT } from "@/lib/voting-console";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { JobLine } from "./job-line";
import { Label } from "@/components/ui/label";

// The admins' call once the vote (and any runoff) closed level: pick the
// winner, or more than one for joint winners, as the bot's tie prompt does.
export function TieBreak({
  round,
  category,
  games,
  job,
}: {
  round: VotingRound;
  category: VotingCategory;
  games: Game[];
  job: BotJob | null;
}) {
  const label = CATEGORY_SHORT[category];
  const [picked, setPicked] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hadRunoff = (round.runoff_ties?.[category]?.length ?? 0) > 0;

  const toggle = (id: number) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await resolveTieAction(round.round_number, category, picked);
      if (!result.ok) setError(result.error ?? "Couldn't break the tie.");
    });
  };

  return (
    <fieldset className="mt-5 rounded-md bg-card px-3.5 pt-1 pb-3.5">
      <legend className="sr-only">{label} tie break</legend>
      <p className="font-label flex items-center gap-2 pt-2.5 text-[0.95rem] font-extrabold tracking-[0.06em]">
        <Scale aria-hidden className="size-4" />
        {label} tie break
      </p>
      <p className="mt-1 mb-2.5 text-[0.84rem] leading-snug text-dim-foreground">
        {hadRunoff ? "The runoff tied again. " : "The vote closed tied. "}
        Pick the winner, or more than one for joint winners. The bot announces it.
      </p>
      <ul className="space-y-1.5">
        {games.map((game) => (
          <li key={game.game_id}>
            <Label variant="option" className="flex cursor-pointer items-center gap-2.5 px-1 py-1">
              <Checkbox checked={picked.includes(game.game_id)} onCheckedChange={() => toggle(game.game_id)} />
              <span className="font-semibold">{game.title}</span>
            </Label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant="highlight"
          size="sm"
          disabled={picked.length === 0 || pending}
          onClick={submit}
        >
          {pending ? "Working..." : picked.length > 1 ? "Make them joint winners" : "Pick the winner"}
        </Button>
        <JobLine job={job} what="The tie break announcement" />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
