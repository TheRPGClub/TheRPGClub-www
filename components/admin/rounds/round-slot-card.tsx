import { Replace, Undo2 } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { listNames, slotName, type RoundSlot } from "@/lib/rounds";
import { GamePicker } from "@/components/member/game-picker";
import { GameCover } from "@/components/issue/game-cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fieldLabel } from "./styles";
import { Label } from "@/components/ui/label";

// One slot of the round being edited: its game (swapped through the
// picker), its Reddit URL, a yellow rule once changed (with Put back) and a
// red one while another slot holds the same game.
export function RoundSlotCard({
  slot,
  index,
  count,
  changed,
  twins,
  picking,
  pending,
  onPutBack,
  onPick,
  onPickGame,
  onReddit,
}: {
  slot: RoundSlot;
  index: number;
  count: number;
  changed: boolean;
  twins: number[] | undefined;
  picking: boolean;
  pending: boolean;
  onPutBack: () => void;
  onPick: (open: boolean) => void;
  onPickGame: (game: Game) => void;
  onReddit: (url: string) => void;
}) {
  const title = slot.game?.title ?? `GameDB game ${slot.gameId ?? "?"}`;
  return (
    <li
      className={cn(
        "rounded-md bg-card p-3.5 ring-inset",
        twins ? "ring-1 ring-destructive" : changed ? "ring-1 ring-highlight" : "ring-1 ring-border",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={fieldLabel}>
          {slotName(index, count)}
          {changed && <span className="ml-2 text-highlight">Changed</span>}
          {twins && (
            <span className="ml-2 text-destructive">Also in {listNames(twins.map((j) => slotName(j, count)))}</span>
          )}
        </span>
        {changed && (
          <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={onPutBack}>
            <Undo2 data-icon="inline-start" />
            Put back
          </Button>
        )}
      </div>
      <div className="mt-2 grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-3">
        <GameCover title={title} coverUrl={slot.game?.cover_url} className="w-11 rounded-xs" fallbackClassName="p-1 text-[0.5rem]" />
        <div className="min-w-0">
          <p className="font-headline text-[1.45rem] leading-[0.95] break-words">{title}</p>
          {!picking && (
            <Button type="button" variant="outline" size="sm" className="mt-2" disabled={pending} onClick={() => onPick(true)}>
              <Replace data-icon="inline-start" />
              Change game
            </Button>
          )}
        </div>
      </div>
      {picking && (
        <div className="mt-3 flex items-start gap-2">
          <GamePicker compact autoFocus className="min-w-0 flex-1" placeholder="Search for the new game…" onPick={onPickGame} />
          <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => onPick(false)}>
            Cancel
          </Button>
        </div>
      )}
      <Label variant="frame" className="mt-3 block space-y-1.5">
        <span className={fieldLabel}>Reddit URL</span>
        <Input
          type="url"
          inputMode="url"
          value={slot.reddit}
          onChange={(e) => onReddit(e.target.value)}
          placeholder="https://www.reddit.com/r/…"
          disabled={pending}
        />
      </Label>
    </li>
  );
}
