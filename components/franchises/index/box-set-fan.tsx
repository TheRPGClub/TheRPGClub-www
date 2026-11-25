import type { FranchiseTile } from "@/lib/franchises/browse";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

// Where each of the three covers sits in the fan: the newest Mainline game
// stands in the middle, the next two lean out behind it, hinged at the
// foot nearest the middle one.
const PLACE = [
  "z-2 w-[51%] -translate-x-1/2 group-hover/tile:outline-2 group-hover/tile:outline-offset-2 group-hover/tile:outline-highlight group-focus-visible/tile:outline-2 group-focus-visible/tile:outline-offset-2 group-focus-visible/tile:outline-highlight motion-safe:transition-[bottom] group-hover/tile:bottom-2.5 group-focus-visible/tile:bottom-2.5",
  "z-1 w-[39%] origin-bottom-right -translate-x-[106%] -rotate-6",
  "z-1 w-[39%] origin-bottom-left translate-x-[6%] rotate-6",
];

// A Franchise's box set (design pick: Wall of box sets): up to three of its
// covers fanned on the shelf. With none, its name on an ink block stands
// in the middle.
export function BoxSetFan({ tile }: { tile: FranchiseTile }) {
  const covers = tile.covers.length
    ? tile.covers
        .slice(0, 3)
        .map((c) => ({
          key: c.game_id,
          title: c.title,
          url: c.cover_url as string | null,
        }))
    : [{ key: 0, title: tile.name, url: null }];
  return (
    <div aria-hidden className="relative aspect-[6/5]">
      {covers.map((cover, i) => (
        <div
          key={cover.key}
          className={cn(
            "absolute bottom-1.5 left-1/2 rounded-sm shadow-[0_8px_16px_rgb(0_0_0/0.55)]",
            PLACE[i],
          )}
        >
          <GameCover
            title={cover.title}
            coverUrl={cover.url}
            className="w-full"
            fallbackClassName="p-2 text-[0.8rem] sm:text-base"
          />
        </div>
      ))}
    </div>
  );
}
