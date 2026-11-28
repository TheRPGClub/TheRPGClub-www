import type { SlotSquares } from "@/lib/challenges/board";
import type { PoolGame } from "@/lib/challenges/types";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

// A Challenge's Format as a picture on its flyer, billboard or banner: a fan
// of Pool covers, a row of year slots, or Secret Santa's name tag. Drawn in
// the tint's paper type; the Format ink stays on its square.

export function CoverFan({
  games,
  size = "sm",
  muted = false,
}: {
  games: readonly PoolGame[];
  size?: "sm" | "lg";
  muted?: boolean;
}) {
  if (games.length === 0) return null;
  const lg = size === "lg";
  return (
    <div data-slot="cover-fan" data-size={size} className={cn("flex", lg ? "pr-[22px]" : "my-1.5")} aria-hidden>
      {games.slice(0, 3).map((game) => (
        <GameCover
          key={game.game_id}
          title={game.title}
          coverUrl={game.cover_url}
          className={cn(
            lg
              ? "-mr-[22px] w-[84px] shadow-[0_10px_22px_rgb(0_0_0/0.5)]"
              : "-mr-[18px] w-[62px] shadow-[0_6px_14px_rgb(0_0_0/0.45)]",
            muted && "brightness-75 saturate-[0.3]",
          )}
          fallbackClassName={lg ? "text-[0.8rem] p-1.5" : "text-[0.62rem] p-1"}
        />
      ))}
    </div>
  );
}

export function SlotRow({ squares, size = "sm" }: { squares: SlotSquares; size?: "sm" | "lg" }) {
  const box = size === "lg" ? "h-[30px] w-[22px]" : "size-[18px]";
  return (
    <div data-slot="slot-row" data-size={size} className="my-1 flex flex-wrap items-center gap-1" aria-hidden>
      {squares.filled.map((on, i) => (
        <i
          key={i}
          className={cn(
            "rounded-xs",
            box,
            on ? "bg-(--challenge-type)/92" : "shadow-[inset_0_0_0_1.5px_rgb(244_244_240/0.6)]",
          )}
        />
      ))}
      {squares.more > 0 && (
        <span className="font-label ml-0.5 text-[0.72rem] font-extrabold tracking-[0.08em]">+{squares.more}</span>
      )}
    </div>
  );
}

// Secret Santa's paper name tag: "To: you?".
export function NameTag({ size = "sm" }: { size?: "sm" | "lg" }) {
  const lg = size === "lg";
  return (
    <div
      aria-hidden
      data-slot="flyer-name-tag"
      data-size={size}
      className={cn(
        "relative my-1.5 flex flex-col justify-center bg-(--challenge-type) text-(--challenge-tint)",
        lg ? "h-[112px] w-[190px] pl-[46px]" : "h-[62px] w-[120px] pl-7",
      )}
    >
      <i
        data-slot="flyer-name-tag-hole"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-full bg-(--challenge-tint)",
          lg ? "left-[18px] size-3" : "left-[9px] size-2",
        )}
      />
      <small className="font-label text-[0.72rem] leading-none font-extrabold tracking-[0.1em] text-slip-muted-foreground">
        To
      </small>
      <b
        className={cn(
          "font-headline leading-[0.9] font-normal text-background",
          lg ? "mt-1 text-[2.4rem]" : "text-[1.25rem]",
        )}
      >
        You?
      </b>
    </div>
  );
}
