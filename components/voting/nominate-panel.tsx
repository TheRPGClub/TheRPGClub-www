"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Nomination, VotingCategory } from "@/lib/api/types";
import { useNomination } from "@/hooks/use-nomination";
import { Button } from "@/components/ui/button";
import { NominationForm } from "./nomination-form";
import { EmptySlot, ExistingNomination, SlotError } from "./nomination-slot";

// The viewer's nomination slot for one track, set inside the yellow ballot
// strip: their pick with Edit and Withdraw, or an empty slot with a
// Nominate button that opens the form. Ink controls on the yellow strip.

const TRACK_NOUN: Record<VotingCategory, string> = {
  gotm: "an RPG",
  nr_gotm: "a non-RPG game",
};

export interface NominatePanelProps {
  category: VotingCategory;
  // The round being nominated for.
  round: number;
  // Whether the nomination window is open (the backend enforces this too).
  open: boolean;
  // The signed-in member's existing nomination for the round, if any.
  existing: Nomination | null;
}

export function NominatePanel({ category, round, open, existing }: NominatePanelProps) {
  const nomination = useNomination(category, round, existing);
  const { pending } = nomination;

  if (!open) {
    if (!existing) return <EmptySlot>Nominations are closed.</EmptySlot>;
    return <ExistingNomination nomination={existing} note="Nominations are closed." />;
  }

  if (nomination.editing) {
    return <NominationForm nomination={nomination} replacing={!!existing} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {existing ? (
        <ExistingNomination nomination={existing} />
      ) : (
        <EmptySlot>You haven&apos;t nominated {TRACK_NOUN[category]} yet</EmptySlot>
      )}
      {nomination.error && <SlotError>{nomination.error}</SlotError>}
      <div className="mt-auto flex flex-wrap gap-2">
        {existing ? (
          <>
            <Button
              type="button"
              variant="inverse-outline"
              size="sm"
              onClick={nomination.startEditing}
              disabled={pending}
              className="h-8.5 px-3"
            >
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
            <Button
              type="button"
              variant="inverse-outline"
              size="sm"
              onClick={nomination.withdraw}
              disabled={pending}
              className="h-8.5 px-3"
            >
              {pending ? <Loader2 className="animate-spin" /> : <Trash2 data-icon="inline-start" />}
              Withdraw
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="inverse"
            onClick={nomination.startEditing}
            className="h-8.5 px-3"
          >
            <Plus data-icon="inline-start" />
            Nominate a game
          </Button>
        )}
      </div>
    </div>
  );
}
