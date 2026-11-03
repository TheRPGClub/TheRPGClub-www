"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Replace, Undo2 } from "lucide-react";
import { updateRoundEntriesAction, type RoundEntryEdit } from "@/app/actions/rounds";
import type { AdminRoundEntry } from "@/lib/api/admin-rounds";
import type { BotJob, Game, VotingCategory } from "@/lib/api/types";
import { roundEntryId, TRACK_NAME } from "@/lib/rounds";
import { GamePicker } from "@/components/member/game-picker";
import { GameCover } from "@/components/issue/game-cover";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { RoundProof } from "@/components/admin/rounds/round-proof";
import { fieldLabel } from "@/components/admin/rounds/styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Slot {
  id: number;
  index: number;
  game: Game | null;
  gameId: number | null;
  reddit: string;
}

function slotOf(entry: AdminRoundEntry): Slot {
  return {
    id: roundEntryId(entry),
    index: entry.game_index,
    game: entry.game ?? null,
    gameId: entry.gamedb_game_id,
    reddit: entry.reddit_url ?? "",
  };
}

// What changed in a slot since it was saved, as the PATCH body wants it.
function editOf(slot: Slot, saved: Slot): RoundEntryEdit | null {
  const edit: RoundEntryEdit = { id: slot.id };
  if (slot.gameId !== saved.gameId && slot.gameId !== null) edit.gamedb_game_id = slot.gameId;
  if (slot.reddit.trim() !== saved.reddit.trim()) edit.reddit_url = slot.reddit;
  return Object.keys(edit).length > 1 ? edit : null;
}

const SLOT_TAG = "ABCDEFGHIJ";

// Edit one track's round: swap any slot's game and set its Reddit URL.
// Only changed slots are sent, one PATCH each; every staff edit has the bot
// reload the round, and the proof follows the newest reload job.
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
  const [saved, setSaved] = useState<Slot[]>(() => entries.map(slotOf));
  const [slots, setSlots] = useState<Slot[]>(() => entries.map(slotOf));
  const [picking, setPicking] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<BotJob | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const [pending, startTransition] = useTransition();

  const edits = slots
    .map((slot, i) => editOf(slot, saved[i]))
    .filter((e): e is RoundEntryEdit => e !== null);

  const update = (i: number, patch: Partial<Slot>) =>
    setSlots((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (edits.length === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await updateRoundEntriesAction(category, roundNumber, edits);
      const updated = new Map((result.entries ?? []).map((entry) => [roundEntryId(entry), entry]));
      if (updated.size > 0) {
        // Keep the picked Game for the proof; the PATCH answers without it.
        setSaved((list) =>
          list.map((s, i) => {
            const entry = updated.get(s.id);
            return entry ? { ...slotOf(entry), game: slots[i].game } : s;
          }),
        );
        setSavedOnce(true);
        if (result.job) setJob(result.job);
      }
      if (!result.ok) setError(result.error ?? "Couldn't save the round.");
    });
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10">
      <form onSubmit={save} className="min-w-0 space-y-4">
        <ol className="space-y-3">
          {slots.map((slot, i) => {
            const title = slot.game?.title ?? `GameDB game ${slot.gameId ?? "?"}`;
            const changed = editOf(slot, saved[i]) !== null;
            return (
              <li
                key={slot.id}
                className={cn(
                  "rounded-md bg-ink-2 p-3.5 ring-inset",
                  changed ? "ring-1 ring-highlight" : "ring-1 ring-rule",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={fieldLabel}>
                    {slots.length > 1 ? `Game ${SLOT_TAG[i] ?? i + 1}` : "Game"}
                    {changed && <span className="ml-2 text-highlight">Changed</span>}
                  </span>
                  {changed && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => {
                        update(i, saved[i]);
                        if (picking === i) setPicking(null);
                      }}
                    >
                      <Undo2 data-icon="inline-start" />
                      Put back
                    </Button>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-3">
                  <GameCover
                    title={title}
                    coverUrl={slot.game?.cover_url}
                    className="w-11 rounded-xs"
                    fallbackClassName="p-1 text-[0.5rem]"
                  />
                  <div className="min-w-0">
                    <p className="font-headline text-[1.45rem] leading-[0.95] break-words">{title}</p>
                    {picking !== i && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        disabled={pending}
                        onClick={() => setPicking(i)}
                      >
                        <Replace data-icon="inline-start" />
                        Change game
                      </Button>
                    )}
                  </div>
                </div>
                {picking === i && (
                  <div className="mt-3 flex items-start gap-2">
                    <GamePicker
                      compact
                      autoFocus
                      className="min-w-0 flex-1"
                      placeholder="Search for the new game…"
                      onPick={(game) => {
                        setPicking(null);
                        if (slots.some((s, j) => j !== i && s.gameId === game.game_id)) {
                          setError(`${game.title} is already in this round.`);
                          return;
                        }
                        setError(null);
                        update(i, { game, gameId: game.game_id });
                      }}
                    />
                    <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => setPicking(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
                <label className="mt-3 block space-y-1.5">
                  <span className={fieldLabel}>Reddit URL</span>
                  <Input
                    type="url"
                    inputMode="url"
                    value={slot.reddit}
                    onChange={(e) => update(i, { reddit: e.target.value })}
                    placeholder="https://www.reddit.com/r/…"
                    disabled={pending}
                  />
                </label>
              </li>
            );
          })}
        </ol>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="highlight" disabled={pending || edits.length === 0}>
            {pending ? <Loader2 className="animate-spin" /> : <Check data-icon="inline-start" />}
            {edits.length > 1 ? `Save ${edits.length} changes` : "Save changes"}
          </Button>
          <span className="text-[0.84rem] text-paper-mute">
            {edits.length === 0
              ? savedOnce
                ? "Saved. Each change has the bot reload the round."
                : "Change a game or a Reddit URL to save."
              : `The bot reloads ${TRACK_NAME[category]} round ${roundNumber} after each change.`}
          </span>
        </div>
      </form>

      <ProofCard
        jobId={job?.id ?? null}
        initialJob={job}
        what="The bot's round reload"
        caption={
          savedOnce && !job
            ? "Saved. The reload job isn't on the wire yet; the desk lists it."
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
