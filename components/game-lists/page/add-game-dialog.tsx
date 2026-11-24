"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GamePicker } from "@/components/member/game-picker";

// The dashed tile at the end of the wall that adds a game: a GameDB search
// in a dialog. The game lands at the bottom of a ranked list.
export function AddGameTile({ listName, onAdd }: { listName: string; onAdd: (gameId: number) => Promise<string | null> }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={(next) => (setOpen(next), setError(null))}>
      <Button variant="add" size="tile" onClick={() => setOpen(true)} className="w-full">
        <Plus aria-hidden />
        Add a game
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a game</DialogTitle>
          <DialogDescription>To {listName}. On a ranked list it goes in last; move it up from there.</DialogDescription>
        </DialogHeader>
        <GamePicker
          compact
          autoFocus
          placeholder="Search games…"
          onPick={(game) =>
            startTransition(async () => {
              const failed = await onAdd(game.game_id);
              if (failed) setError(failed);
              else setOpen(false);
            })
          }
        />
        {pending && <p className="text-sm text-faint-foreground">Adding…</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
