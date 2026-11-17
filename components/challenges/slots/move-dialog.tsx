"use client";

import { useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { moveSlotAction } from "@/app/actions/challenge-slots";
import type { MovableGame } from "@/lib/challenges/slots";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GameCover } from "@/components/issue/game-cover";
import { useRunNotice } from "@/components/challenges/run-notice";
import { YearChoices } from "@/components/challenges/slots/year-choices";

export type ShownGame = MovableGame & { tag?: "past" | "moved" | null };

const TAG_LINE = {
  past: (owner: string) => `Cleared before the Run started, picked by ${owner}.`,
  moved: (owner: string) => `Moved here by ${owner} from another year it was released in.`,
};

// Move a game (surface brief challenges-slots): choose one of the Run's
// Cleared games that fits an open year, then the year. From a Cleared tile it
// opens on that game; on another member's Run (or an ended one) it only shows
// the game, which is the phone's way to see a tile's cover. A refusal goes to
// the panel's notice slip.
export function MoveDialog({
  runId,
  state,
  games,
  canMove,
  owner,
  onState,
}: {
  runId: number;
  state: { game: ShownGame | null } | null;
  games: MovableGame[];
  canMove: boolean;
  owner: string;
  onState: (state: { game: ShownGame | null } | null) => void;
}) {
  const setNotice = useRunNotice();
  const [pending, startTransition] = useTransition();
  const game = state?.game ?? null;
  const move = (target: MovableGame, year: number) =>
    startTransition(async () => {
      setNotice(null);
      const result = await moveSlotAction(runId, target.game_id, year);
      onState(null);
      if (!result.ok) setNotice({ title: "Not moved", message: result.error ?? "That didn't work." });
    });

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onState(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{game ? game.title : "Move a game"}</DialogTitle>
          <DialogDescription>
            {game
              ? game.year
                ? `Fills ${game.year}.${game.tag ? ` ${TAG_LINE[game.tag](canMove ? "you" : owner)}` : ""}`
                : "Cleared, waiting for an open year it was released in."
              : "A Cleared game can fill any open year it was released in."}
          </DialogDescription>
        </DialogHeader>
        {game ? (
          <div className="grid grid-cols-[96px_1fr] items-start gap-4">
            <GameCover title={game.title} coverUrl={game.cover_url} className="w-24" fallbackClassName="text-sm" />
            <div className="space-y-3">
              {canMove && (
                <YearChoices
                  label="Move it to"
                  years={game.moveYears}
                  pending={pending}
                  empty="No other open year of your Run fits it."
                  onPick={(year) => move(game, year)}
                />
              )}
              {canMove && games.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => onState({ game: null })}>
                  <ArrowLeft aria-hidden /> Another game
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ul className="-mx-2 max-h-[60vh] overflow-y-auto">
            {games.map((g) => (
              <li key={g.game_id}>
                <Button
                  type="button"
                  variant="pick-row"
                  size="bare"
                  onClick={() => onState({ game: g })}
                  className="grid w-full grid-cols-[36px_1fr] items-center gap-3 px-2 py-2"
                >
                  <GameCover title={g.title} coverUrl={g.cover_url} className="w-9" fallbackClassName="text-[0.5rem] p-0.5" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{g.title}</span>
                    <span className="block text-sm text-dim-foreground">
                      {g.year ? `Fills ${g.year}` : "Waiting for an open year"} · fits {g.moveYears.join(", ")}
                    </span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
