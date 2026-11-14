"use client";

import { Loader2, X } from "lucide-react";
import type { NominationState } from "@/hooks/use-nomination";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// The nomination form, set on an ink inset inside the yellow strip so the
// game search and its results read as they do everywhere else.
export function NominationForm({
  nomination: n,
  replacing,
}: {
  nomination: NominationState;
  // The viewer already has a nomination this saves over.
  replacing: boolean;
}) {
  return (
    <form onSubmit={n.submit} className="space-y-3 rounded-sm bg-background p-3.5 text-foreground">
      <p className="font-label text-[0.95rem] font-extrabold tracking-[0.06em]">
        {replacing ? "Replace your nomination" : "Nominate a game"}
      </p>

      {n.selectedGame ? (
        <div className="flex items-center gap-2 rounded-sm border border-border-strong bg-card px-2.5 py-1.5 text-sm">
          <span className="truncate font-medium">{n.selectedGame.title}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Change game"
            onClick={() => n.setSelectedGame(null)}
            disabled={n.pending}
            className="ml-auto"
          >
            <X />
          </Button>
        </div>
      ) : (
        <GamePicker compact autoFocus onPick={n.setSelectedGame} placeholder="Search for a game…" />
      )}

      <label className="block">
        <span className="sr-only">Why this game? (optional)</span>
        <Textarea
          variant="note"
          value={n.reason}
          onChange={(e) => n.setReason(e.target.value)}
          rows={3}
          maxLength={1500}
          placeholder="Why this game? (optional)"
          disabled={n.pending}
          className="inline-block min-h-0 px-3 text-sm field-sizing-fixed md:text-sm"
        />
      </label>

      {n.error && <p className="text-sm text-destructive">{n.error}</p>}

      <p className="text-xs text-faint-foreground">
        One nomination per member per track; saving again replaces it. Also works via{" "}
        <code className="rounded-xs bg-muted px-1 py-0.5 text-[11px] text-dim-foreground">
          /nominate
        </code>{" "}
        on Discord.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={n.cancel} disabled={n.pending}>
          Cancel
        </Button>
        <Button type="submit" variant="highlight" size="sm" disabled={n.pending || !n.selectedGame}>
          {n.pending ? (
            <Loader2 className="animate-spin" />
          ) : replacing ? (
            "Save nomination"
          ) : (
            "Nominate"
          )}
        </Button>
      </div>
    </form>
  );
}
