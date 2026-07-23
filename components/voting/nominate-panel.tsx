"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import {
  deleteNominationAction,
  upsertNominationAction,
} from "@/app/actions/nominations";
import type { Game, Nomination, VotingCategory } from "@/lib/api/types";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";

const accentClasses = {
  emerald: {
    heading: "text-emerald-200/90",
    ring: "border-emerald-500/30",
  },
  purple: {
    heading: "text-purple-200/90",
    ring: "border-purple-500/30",
  },
} as const;

export interface NominatePanelProps {
  category: VotingCategory;
  // The nomination round (current round + 1).
  round: number;
  accent: keyof typeof accentClasses;
  // Whether the nomination window is open (the backend enforces this too).
  open: boolean;
  // The signed-in member's existing nomination for the round, if any.
  existing: Nomination | null;
}

export function NominatePanel({
  category,
  round,
  accent,
  open,
  existing,
}: NominatePanelProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const accentStyle = accentClasses[accent];

  if (!open) {
    if (!existing) return null;
    return (
      <ExistingNomination
        nomination={existing}
        accentStyle={accentStyle}
        note="Nominations are closed."
      />
    );
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

  if (existing && !editing) {
    return (
      <div className="space-y-2">
        <ExistingNomination
          nomination={existing}
          accentStyle={accentStyle}
          actions={
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={startEditing}
                disabled={pending}
              >
                <Pencil className="size-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={pending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Withdraw
              </Button>
            </>
          }
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-3 rounded-xl border ${accentStyle.ring} bg-card p-4`}
    >
      <p className={`text-sm font-semibold ${accentStyle.heading}`}>
        {existing ? "Replace your nomination" : "Nominate a game"}
      </p>

      {selectedGame ? (
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-sm">
          <span className="truncate font-medium">{selectedGame.title}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Change game"
            onClick={() => setSelectedGame(null)}
            disabled={pending}
          >
            <X />
          </Button>
        </div>
      ) : (
        <GamePicker
          compact
          onPick={setSelectedGame}
          placeholder="Search for a game…"
        />
      )}

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        maxLength={1500}
        placeholder="Why this game? (optional)"
        disabled={pending}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          One nomination per member — submitting again replaces it. Also works
          via{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
            /nominate
          </code>{" "}
          on Discord.
        </p>
        <div className="flex shrink-0 gap-2">
          {editing && existing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={pending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={pending || !selectedGame}>
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : existing ? (
              "Save nomination"
            ) : (
              "Nominate"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

function ExistingNomination({
  nomination,
  accentStyle,
  note,
  actions,
}: {
  nomination: Nomination;
  accentStyle: (typeof accentClasses)[keyof typeof accentClasses];
  note?: string;
  actions?: React.ReactNode;
}) {
  const title =
    nomination.game?.title ?? `Game #${nomination.gamedb_game_id ?? "?"}`;
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border ${accentStyle.ring} bg-card px-4 py-3`}
    >
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Your nomination
        </p>
        <p className="truncate text-sm font-semibold">{title}</p>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center">{actions}</div>}
    </div>
  );
}
