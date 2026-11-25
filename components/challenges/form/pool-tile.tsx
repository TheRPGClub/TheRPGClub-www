"use client";

import { X } from "lucide-react";
import type { SortItemProps } from "@/hooks/use-sortable";
import type { EditorGame, PoolSide } from "@/lib/challenges/pool-editor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";

// A cover in the Pool editor (pick 8, 8B's tiles): a Core Game is ringed in
// the Challenge tint's hi, an Optional one sits plain; a paper "New" tag
// marks a game that joined in the last 14 days and "Added" one picked by
// hand. Under it the switch moves it between Core and Optional or leaves it
// out; dragging the cover onto the other section does the same (`item`,
// from useSortable in the Pool builder).
export function PoolTile({
  game,
  side,
  item,
  onMove,
  onLeaveOut,
}: {
  game: EditorGame;
  side: PoolSide;
  item: SortItemProps;
  onMove: (to: PoolSide) => void;
  onLeaveOut: () => void;
}) {
  return (
    <li {...item} className="flex flex-col gap-1.5">
      <div
        title={game.title}
        className={cn(
          "relative rounded-sm",
          side === "core" && "outline-2 outline-offset-2 outline-(--challenge-tint-hi)",
        )}
      >
        <GameCover
          title={game.title}
          coverUrl={game.cover_url}
          alt={game.title}
          className="pointer-events-none w-full"
          fallbackClassName="text-[0.8rem] p-1.5"
        />
        {game.tag && (
          <span className="font-label absolute bottom-[5px] left-[5px] rounded-xs bg-foreground px-1 pt-[3px] pb-0.5 text-[0.66rem] leading-none font-extrabold tracking-[0.06em] text-background">
            {game.tag === "new" ? "New" : "Added"}
          </span>
        )}
      </div>
      <div
        role="group"
        aria-label={`${game.title}: place in the Pool`}
        className="grid grid-cols-[1fr_1.45fr_auto] overflow-hidden rounded-xs shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
      >
        <Button
          type="button"
          variant="pool-switch-core"
          size="bare"
          aria-pressed={side === "core"}
          aria-label={`Make ${game.title} a Core Game`}
          onClick={() => side !== "core" && onMove("core")}
          className="items-center justify-center"
        >
          Core
        </Button>
        <Button
          type="button"
          variant="pool-switch"
          size="bare"
          aria-pressed={side === "optional"}
          aria-label={`Make ${game.title} an Optional Game`}
          onClick={() => side !== "optional" && onMove("optional")}
          className="items-center justify-center"
        >
          Optional
        </Button>
        <Button
          type="button"
          variant="pool-switch"
          size="bare"
          aria-label={`Leave ${game.title} out of the Pool`}
          onClick={onLeaveOut}
          className="w-7 items-center justify-center sm:w-6 [&_svg]:size-3.5"
        >
          <X aria-hidden />
        </Button>
      </div>
    </li>
  );
}
