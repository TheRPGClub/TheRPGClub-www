"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createChallengeAction, updateChallengeAction } from "@/app/actions/challenges";
import { addSource, removeSource, validateDraft, type ChallengeDraft, type DraftGame, type DraftSource } from "@/lib/challenges/form";
import { leaveOut, moveGame, poolColumns, putBack, setTarget, stepTarget, type PoolSide } from "@/lib/challenges/pool-editor";
import { usePoolPreview } from "@/hooks/use-pool-preview";

// The words of the rule sentence a member can open, one at a time.
export type RuleWordKey =
  | "target"
  | "sources"
  | "season-start"
  | "season-end"
  | "schedule"
  | "ends-on"
  // Assignment's calendar (www#110).
  | "signup-cutoff"
  | "pick-deadline"
  | "reveal"
  // Slots (www#109): the range's two ends and Counts past play.
  | "slots-first"
  | "slots-last"
  | "past-play";

export interface EditTarget {
  id: number;
  // A Run exists, or the Format's rules aren't edited on the website yet.
  locked: boolean;
  closedForGood: boolean;
}

// The create and edit form's state: the draft, the word being edited, the
// live Pool, and saving. A new Challenge opens on its page (with the
// duplicate-name warning, when the API gave one); an edit goes back to it.
export function useChallengeForm(initial: ChallengeDraft, edit: EditTarget | null) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [open, setOpen] = useState<RuleWordKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [saving, startSaving] = useTransition();
  const preview = usePoolPreview(draft);
  const columns = poolColumns(draft, preview.sources);
  const errors = validateDraft(draft, preview.known ? columns.optionalCount : null);
  const locked = edit?.locked ?? false;

  const update = (change: Partial<ChallengeDraft>) => setDraft((d) => ({ ...d, ...change }));
  const toggleWord = (key: RuleWordKey) => setOpen((current) => (current === key ? null : key));

  const save = () => {
    setTried(true);
    setError(null);
    const lockedChecks =
      draft.format === "pool" ? [errors.name, errors.endsOn, errors.sources, errors.target] : [errors.name, errors.endsOn];
    const first = (locked ? lockedChecks : Object.values(errors)).find(Boolean);
    if (first) {
      setError(first);
      return;
    }
    startSaving(async () => {
      const result = edit
        ? await updateChallengeAction(edit.id, draft, {
            locked,
            closedForGood: edit.closedForGood,
          })
        : await createChallengeAction(draft);
      if (!result.ok || !result.data) {
        setError(result.error ?? "That didn't save. Try again.");
        return;
      }
      const dup = result.warnings?.find((w) => w.code === "duplicate_name");
      const query = dup ? `?dup=${(dup.challenge_ids ?? []).join(",")}` : "";
      router.push(`/challenges/${result.data.id}${query}`);
    });
  };

  return {
    draft,
    update,
    open,
    toggleWord,
    openWord: setOpen,
    closeWord: () => setOpen(null),
    preview,
    columns,
    // Words go orange as soon as they're wrong; what's missing waits for a
    // save.
    errors: tried
      ? errors
      : {
          target: errors.target,
          season: errors.season,
          endsOn: errors.endsOn,
          slotsFirst: errors.slotsFirst,
          slotsLast: errors.slotsLast,
          calendar: errors.calendar,
        },
    error,
    saving,
    locked,
    // The end date stays editable after Runs exist, until the Challenge is
    // Closed for good.
    endDateLocked: edit?.closedForGood ?? false,
    save,
    addSource: (source: DraftSource) => setDraft((d) => addSource(d, source)),
    removeSource: (source: DraftSource) => setDraft((d) => removeSource(d, source)),
    // The Pool editor (lib/challenges/pool-editor).
    moveGame: (game: DraftGame, to: PoolSide) => setDraft((d) => moveGame(d, game, to, columns.sourceIds)),
    leaveOut: (game: DraftGame) => setDraft((d) => leaveOut(d, game)),
    putBack: (game: DraftGame) => setDraft((d) => putBack(d, game, columns.sourceIds)),
    stepTarget: (delta: number) => setDraft((d) => stepTarget(d, delta)),
    setTarget: (value: number) => setDraft((d) => setTarget(d, value)),
  };
}

export type ChallengeFormState = ReturnType<typeof useChallengeForm>;
