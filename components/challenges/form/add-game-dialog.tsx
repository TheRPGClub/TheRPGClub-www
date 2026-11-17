"use client";

import type { DraftGame } from "@/lib/challenges/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GamePicker } from "@/components/member/game-picker";

// "Add a game by hand": a GameDB search whose pick joins the Pool whatever
// its franchise.
export function AddGameDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (game: DraftGame) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a game by hand</DialogTitle>
          <DialogDescription>It joins the Pool whatever its franchise or collection.</DialogDescription>
        </DialogHeader>
        {open && (
          <GamePicker
            compact
            autoFocus
            onPick={(game) => {
              onPick({
                game_id: game.game_id,
                title: game.title,
                cover_url: game.cover_url,
              });
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
