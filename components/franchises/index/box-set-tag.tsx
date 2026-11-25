import {
  progressPercent,
  tagCounts,
  yearSpan,
  type FranchiseTile,
} from "@/lib/franchises/browse";
import { Progress } from "@/components/ui/progress";
import { GameCover } from "@/components/issue/game-cover";
import { CountLine } from "@/components/franchises/index/count-line";

// The paper tag a box set hangs while it is hovered or focused (from the
// "Box sets on the shelf" sketch): punched at the left, tilted -2deg, it
// carries the name, the Mainline / Spin-off / Add-on counts, a strip of
// covers, then the viewer's Mainline bar and the years. It swings in from
// a steeper tilt; with reduced motion it only fades. The tile already says
// all of it to a screen reader, so the tag is hidden from one.
export function BoxSetTag({ tile }: { tile: FranchiseTile }) {
  const years = yearSpan(tile);
  const plays =
    tile.club_plays > 0
      ? `${tile.club_plays} club ${tile.club_plays === 1 ? "play" : "plays"}`
      : null;
  return (
    <div
      aria-hidden
      className="pointer-events-none invisible absolute top-[46%] left-1/2 z-20 w-[min(22rem,calc(100%+3rem))] -translate-x-1/2 -rotate-2 rounded-xs bg-foreground py-3.5 pr-4 pl-8.5 text-background opacity-0 shadow-[0_14px_28px_rgb(0_0_0/0.6),0_2px_4px_rgb(0_0_0/0.4)] transition-[opacity,visibility] duration-200 ease-out group-hover/tile:visible group-hover/tile:opacity-100 group-focus-visible/tile:visible group-focus-visible/tile:opacity-100 max-sm:hidden motion-safe:-rotate-6 motion-safe:transition-[opacity,visibility,rotate] motion-safe:group-hover/tile:-rotate-2 motion-safe:group-focus-visible/tile:-rotate-2"
    >
      <span className="absolute top-4.5 left-3 size-2.5 rounded-full bg-background shadow-[inset_0_0_0_2px_var(--color-dim-foreground)]" />
      <p className="font-headline text-[1.7rem] leading-[0.9] break-words">
        {tile.name}
      </p>
      <p className="font-label mt-1.5 text-[0.8rem] font-bold tracking-[0.07em] text-background/75">
        <CountLine parts={tagCounts(tile)} />
      </p>
      {tile.covers.length > 0 && (
        <div className="mt-2.5 flex gap-1">
          {tile.covers.map((cover) => (
            <GameCover
              key={cover.game_id}
              title={cover.title}
              coverUrl={cover.cover_url}
              className="w-7.5"
            />
          ))}
        </div>
      )}
      <div className="font-label mt-2.5 flex items-center gap-2 text-[0.78rem] font-extrabold tracking-[0.08em]">
        {tile.progress && (
          <>
            <span>
              You {tile.progress.done}/{tile.progress.total}
            </span>
            <Progress
              tone="inverse"
              value={progressPercent(tile.progress)}
              className="flex-1"
            />
          </>
        )}
        {/* Beside the bar only the years fit; without one, the plays too. */}
        <span>
          {[years, !tile.progress && plays].filter(Boolean).join(" · ")}
        </span>
      </div>
    </div>
  );
}
