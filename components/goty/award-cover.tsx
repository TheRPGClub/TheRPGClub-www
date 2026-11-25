import type { CSSProperties, ReactNode } from "react";
import type { GameSummary } from "@/lib/api/types";
import type { GotyAwardKey } from "@/lib/goty/types";
import { AWARD_INK } from "@/lib/goty/awards";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

// A game's box art on /goty, footed by a 4px bar in its Award's ink (GOTM
// red, NR-GOTM violet, Game of the Year paper). `ringed` draws the 3px ring
// of a game the viewer voted for or picked; `mark` sits in a top corner.
export function AwardCover({
  award,
  game,
  ringed,
  ring = "award",
  mark,
  className,
  fallbackClassName,
}: {
  award: GotyAwardKey | null;
  game: Pick<GameSummary, "title" | "cover_url">;
  ringed?: boolean;
  ring?: "award" | "highlight";
  mark?: ReactNode;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <span
      style={award ? ({ "--award-ink": AWARD_INK[award] } as CSSProperties) : undefined}
      className={cn(
        "relative block rounded-[3.2px] motion-safe:transition-shadow",
        award && "after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-b-[3.2px] after:bg-(--award-ink)",
        ringed && (ring === "highlight" ? "ring-3 ring-highlight" : "ring-3 ring-(--award-ink)"),
        className,
      )}
    >
      <GameCover title={game.title} coverUrl={game.cover_url} className="rounded-[3.2px]" fallbackClassName={fallbackClassName} />
      {mark && <span className="absolute top-2 right-2">{mark}</span>}
    </span>
  );
}
