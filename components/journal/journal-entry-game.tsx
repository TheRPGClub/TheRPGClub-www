"use client";

import { ChevronDown } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import type { JournalEditorGame } from "@/components/journal/journal-entry-editor";

// The game an entry files under, as a chip beside the editor's label that
// reopens the picker.
export function EntryGameChip({
  game,
  disabled,
  onChange,
}: {
  game: JournalEditorGame;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <Button
      variant="picked"
      onClick={onChange}
      disabled={disabled}
      aria-label={`Game: ${game.title}. Change the game`}
      className="ml-auto h-7 max-w-full min-w-0 gap-2 py-0 pr-2.5 pl-1 text-[0.82rem]"
    >
      <span className="block h-[21px] w-4 shrink-0 overflow-hidden rounded-[1.5px] bg-muted">
        {game.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.cover_url} alt="" className="size-full object-cover" />
        )}
      </span>
      <span className="min-w-0 truncate">{game.title}</span>
      <ChevronDown aria-hidden className="size-3.5 shrink-0 text-faint-foreground" />
    </Button>
  );
}

// The picker for the entry's game; a rewrite can keep the game it had.
export function EntryGamePicker({
  autoFocus,
  keepTitle,
  onPick,
  onKeep,
}: {
  autoFocus: boolean;
  // The game to go back to (a rewrite's own); none for a new entry.
  keepTitle: string | null;
  onPick: (game: Game) => void;
  onKeep: () => void;
}) {
  return (
    <div className="mb-2.5">
      <GamePicker compact autoFocus={autoFocus} placeholder="Which game is this entry about…" onPick={onPick} />
      {keepTitle !== null && (
        <Button variant="quiet-link" onClick={onKeep} className="mt-1.5 h-auto p-0 text-[0.8rem]">
          Keep {keepTitle}
        </Button>
      )}
    </div>
  );
}
