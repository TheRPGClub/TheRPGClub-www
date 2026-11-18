"use client";

import { Plus, X } from "lucide-react";
import type { PoolGame } from "@/lib/challenges/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";

// A cover on the form's Pool wall (surface brief challenges-form, 5C). Tapped,
// a source's game is left out (greyed, a paper "Left out" tag, the x turns
// to +) or put back; a game added by hand carries a paper outline and an
// "Added" tag, and tapping it takes it out of the Pool. Locked rules show the
// wall without the controls.
export function PoolTile({
  game,
  state,
  locked,
  onToggle,
}: {
  game: PoolGame;
  state: "in" | "out" | "added";
  locked: boolean;
  onToggle: () => void;
}) {
  const cover = (
    <>
      <GameCover
        title={game.title}
        coverUrl={game.cover_url}
        className={cn(
          "w-full",
          state === "out" && "opacity-28 grayscale",
          state === "added" && "outline-2 outline-offset-2 outline-foreground",
        )}
        fallbackClassName="text-[0.8rem] p-1.5"
      />
      {state !== "in" && (
        <span className="font-label absolute bottom-[5px] left-[5px] rounded-xs bg-foreground px-1 pt-[3px] pb-0.5 text-[0.66rem] leading-none font-extrabold tracking-[0.06em] text-background">
          {state === "out" ? "Left out" : "Added"}
        </span>
      )}
    </>
  );
  if (locked) return <div className="relative">{cover}</div>;
  const label = state === "out" ? `Put ${game.title} back in the Pool` : `Leave ${game.title} out of the Pool`;
  return (
    <Button
      type="button"
      variant="pool-tile"
      size="bare"
      aria-pressed={state === "out"}
      aria-label={state === "added" ? `Take ${game.title} out of the Pool` : label}
      title={game.title}
      onClick={onToggle}
      className="relative block w-full"
    >
      {cover}
      <span
        aria-hidden
        className={cn(
          "absolute top-[5px] right-[5px] grid size-[22px] place-items-center rounded-xs [&_svg]:size-3.5",
          state === "out" ? "bg-foreground text-background" : "bg-background/75 text-foreground",
        )}
      >
        {state === "out" ? <Plus /> : <X />}
      </span>
    </Button>
  );
}
