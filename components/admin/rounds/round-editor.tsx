"use client";

import { Check, Loader2 } from "lucide-react";
import type { AdminRoundEntry } from "@/lib/api/admin-rounds";
import type { VotingCategory } from "@/lib/api/types";
import { roundEntryEdit, TRACK_NAME } from "@/lib/rounds";
import { useRoundEditor } from "@/hooks/use-round-editor";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { Button } from "@/components/ui/button";
import { RoundProof } from "./round-proof";
import { RoundSlotCard } from "./round-slot-card";

// Edit one track's round: swap any slot's game and set its Reddit URL.
// Only changed slots are sent, one PATCH each; every staff edit has the bot
// reload the round, and the proof follows the last reload job.
export function RoundEditor({
  category,
  roundNumber,
  monthYear,
  entries,
}: {
  category: VotingCategory;
  roundNumber: number;
  monthYear: string;
  entries: AdminRoundEntry[];
}) {
  const e = useRoundEditor(category, roundNumber, entries);
  const { slots, saved, edits, pending, savedOnce, jobId } = e;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10">
      <form onSubmit={e.save} className="min-w-0 space-y-4">
        <ol className="space-y-3">
          {slots.map((slot, i) => (
            <RoundSlotCard
              key={slot.id}
              slot={slot}
              index={i}
              count={slots.length}
              changed={roundEntryEdit(slot, saved[i]) !== null}
              twins={e.twinOf.get(i)}
              picking={e.picking === i}
              pending={pending}
              onPutBack={() => {
                e.update(i, saved[i]);
                if (e.picking === i) e.setPicking(null);
              }}
              onPick={(open) => e.setPicking(open ? i : null)}
              onPickGame={(game) => {
                e.setPicking(null);
                e.setError(null);
                e.update(i, { game, gameId: game.game_id });
              }}
              onReddit={(reddit) => e.update(i, { reddit })}
            />
          ))}
        </ol>

        {e.error && (
          <p role="alert" className="text-sm text-destructive">
            {e.error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="highlight" disabled={pending || edits.length === 0}>
            {pending ? <Loader2 className="motion-safe:animate-spin" /> : <Check data-icon="inline-start" />}
            {edits.length > 1 ? `Save ${edits.length} changes` : "Save changes"}
          </Button>
          <span className="text-[0.84rem] text-faint-foreground">
            {edits.length === 0
              ? savedOnce
                ? "Saved. Each change has the bot reload the round."
                : "Change a game or a Reddit URL to save."
              : e.dupes.size > 0
                ? "A game can be in the round once. Swap games by changing both slots, then save."
                : `The bot reloads ${TRACK_NAME[category]} round ${roundNumber} after each change.`}
          </span>
        </div>
      </form>

      <ProofCard
        jobId={jobId}
        what="The bot's round reload"
        caption={
          savedOnce && jobId == null
            ? "Saved. The API queued no reload job for it."
            : "The round as the GOTM history and the bot will carry it."
        }
      >
        <RoundProof
          category={category}
          roundNumber={roundNumber}
          monthYear={monthYear}
          games={slots.map((s) => ({
            key: s.id,
            title: s.game?.title ?? `GameDB game ${s.gameId ?? "?"}`,
            coverUrl: s.game?.cover_url,
            redditUrl: s.reddit.trim() || null,
          }))}
        />
      </ProofCard>
    </div>
  );
}
