"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  deleteNominationAction,
  upsertNominationAction,
} from "@/app/actions/nominations";
import type { Game, Nomination, VotingCategory } from "@/lib/api/types";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The viewer's nomination slot for one track, set inside the yellow ballot
// strip: their pick with Edit and Withdraw, or an empty slot with a
// Nominate button that opens the form. The form itself sits on an ink inset
// so the game search and its results read as they do everywhere else.

const TRACK_NOUN: Record<VotingCategory, string> = {
  gotm: "an RPG",
  nr_gotm: "a non-RPG game",
};

// Ink controls on the yellow strip.
const inkButton = "bg-ink text-paper hover:bg-ink/85";
const inkOutline =
  "border-ink text-ink hover:border-ink hover:bg-ink/10 aria-expanded:bg-ink/10";

export interface NominatePanelProps {
  category: VotingCategory;
  // The round being nominated for.
  round: number;
  // Whether the nomination window is open (the backend enforces this too).
  open: boolean;
  // The signed-in member's existing nomination for the round, if any.
  existing: Nomination | null;
}

export function NominatePanel({
  category,
  round,
  open,
  existing,
}: NominatePanelProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    if (!existing) return <EmptySlot>Nominations are closed.</EmptySlot>;
    return <ExistingNomination nomination={existing} note="Nominations are closed." />;
  }

  const startEditing = () => {
    setSelectedGame(existing?.game ?? null);
    setReason(existing?.reason ?? "");
    setError(null);
    setEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) {
      setError("Pick a game to nominate.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await upsertNominationAction(
        category,
        round,
        selectedGame.game_id,
        reason,
      );
      if (!result.ok) {
        setError(result.error ?? "Failed to save nomination.");
        return;
      }
      setEditing(false);
      setSelectedGame(null);
      setReason("");
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm("Withdraw your nomination? Any votes it received are removed too.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteNominationAction(category, round);
      if (!result.ok) {
        setError(result.error ?? "Failed to withdraw nomination.");
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  if (!editing) {
    return (
      <div className="flex flex-1 flex-col gap-2.5">
        {existing ? (
          <ExistingNomination nomination={existing} />
        ) : (
          <EmptySlot>
            You haven&apos;t nominated {TRACK_NOUN[category]} yet
          </EmptySlot>
        )}
        {error && <SlotError>{error}</SlotError>}
        <div className="mt-auto flex flex-wrap gap-2">
          {existing ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startEditing}
                disabled={pending}
                className={cn("h-8.5 px-3", inkOutline)}
              >
                <Pencil data-icon="inline-start" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={pending}
                className={cn("h-8.5 px-3", inkOutline)}
              >
                {pending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Trash2 data-icon="inline-start" />
                )}
                Withdraw
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={startEditing}
              className={cn("h-8.5 px-3", inkButton)}
            >
              <Plus data-icon="inline-start" />
              Nominate a game
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-sm bg-ink p-3.5 text-paper"
    >
      <p className="font-label text-[0.95rem] font-extrabold tracking-[0.06em]">
        {existing ? "Replace your nomination" : "Nominate a game"}
      </p>

      {selectedGame ? (
        <div className="flex items-center gap-2 rounded-sm border border-rule-strong bg-ink-2 px-2.5 py-1.5 text-sm">
          <span className="truncate font-medium">{selectedGame.title}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Change game"
            onClick={() => setSelectedGame(null)}
            disabled={pending}
            className="ml-auto"
          >
            <X />
          </Button>
        </div>
      ) : (
        <GamePicker
          compact
          autoFocus
          onPick={setSelectedGame}
          placeholder="Search for a game…"
        />
      )}

      <label className="block">
        <span className="sr-only">Why this game? (optional)</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={1500}
          placeholder="Why this game? (optional)"
          disabled={pending}
          className="w-full rounded-sm border border-rule-strong bg-ink-2 px-3 py-2 text-sm text-paper outline-none placeholder:text-paper-mute focus-visible:border-paper-mute disabled:opacity-50"
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-paper-mute">
        One nomination per member per track; saving again replaces it. Also
        works via{" "}
        <code className="rounded-xs bg-ink-3 px-1 py-0.5 text-[11px] text-paper-dim">
          /nominate
        </code>{" "}
        on Discord.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setEditing(false);
            setError(null);
          }}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="highlight"
          size="sm"
          disabled={pending || !selectedGame}
        >
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : existing ? (
            "Save nomination"
          ) : (
            "Nominate"
          )}
        </Button>
      </div>
    </form>
  );
}

function ExistingNomination({
  nomination,
  note,
}: {
  nomination: Nomination;
  note?: string;
}) {
  const game = nomination.game;
  const title = game?.title ?? `Game #${nomination.gamedb_game_id ?? "?"}`;
  const cover = game?.cover_url ?? game?.art_url;
  return (
    <div className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-3.5">
      <span className="block h-20 w-15 overflow-hidden rounded-xs bg-ink ring-2 ring-ink">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-headline grid size-full place-items-center p-1 text-center text-[0.7rem] leading-none text-paper-mute">
            {title}
          </span>
        )}
      </span>
      <div className="min-w-0">
        <p className="font-headline text-[1.75rem] leading-[0.95] text-balance sm:text-[1.9rem]">
          {title}
        </p>
        {nomination.reason && (
          <p className="mt-1 line-clamp-2 text-[0.82rem] text-highlight-ink">
            &ldquo;{nomination.reason}&rdquo;
          </p>
        )}
        {note && (
          <p className="mt-1 text-[0.82rem] font-medium text-highlight-ink">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

function EmptySlot({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-label grid min-h-18 flex-1 place-items-center rounded-xs border-2 border-dashed border-ink/45 p-2.5 text-center text-[0.88rem] font-extrabold tracking-[0.06em] text-highlight-ink">
      {children}
    </p>
  );
}

function SlotError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-[0.85rem] font-semibold text-ink">
      {children}
    </p>
  );
}
