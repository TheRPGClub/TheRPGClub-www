"use client";

import type { YearTile } from "@/lib/challenges/slots";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";
import { useSlotActions } from "@/components/challenges/slots/slot-actions";

// One year of a Run's matrix (surface brief challenges-slots, 3A). Under
// 480px the tiles drop their covers and prompts to the year's two digits on
// a tile in the tint (a tap shows the cover). Your own open years open the
// past-play picker for that year when past play counts; a Cleared tile opens
// the Move menu, or just the game on a Run that isn't yours to change.

const TAG = { past: "Past", moved: "Moved" } as const;

// The year in full, or its two digits on a phone.
function Year({ year }: { year: number }) {
  return (
    <>
      <span className="max-[479px]:hidden">{year}</span>
      <span className="min-[480px]:hidden">{String(year % 100).padStart(2, "0")}</span>
    </>
  );
}

export function YearTileView({ tile }: { tile: YearTile }) {
  if (tile.kind === "none") return <span aria-hidden />;
  if (tile.kind === "ghost") {
    return (
      <span data-slot="year-tile" data-variant="ghost" className="font-headline grid aspect-[3/4] place-items-center rounded-sm border border-dashed border-border text-[0.8rem] text-faint-foreground sm:text-[1.125rem]">
        <Year year={tile.year} />
      </span>
    );
  }
  return tile.kind === "cleared" ? <ClearedTile tile={tile} /> : <OpenTile tile={tile} />;
}

function ClearedTile({ tile }: { tile: Extract<YearTile, { kind: "cleared" }> }) {
  const { own, openGame } = useSlotActions();
  const tag = tile.tag ? ` (${TAG[tile.tag]})` : "";
  return (
    <Button
      type="button"
      variant="pool-tile"
      size="bare"
      aria-label={`${tile.year}: ${tile.game.title}${tag}${own ? ". Move it" : ""}`}
      onClick={() => openGame({ ...tile.game, year: tile.year, moveYears: tile.moveYears, tag: tile.tag })}
      className="relative block aspect-[3/4] w-full"
    >
      <GameCover
        title={tile.game.title}
        coverUrl={tile.game.cover_url}
        className="size-full shadow-[0_6px_14px_rgb(0_0_0/0.45)] max-[479px]:hidden"
        fallbackClassName="p-1.5 text-[0.85rem]"
      />
      <span className="font-headline grid size-full place-items-center rounded-sm bg-(--challenge-tint) text-[0.8rem] text-(--challenge-type) min-[480px]:hidden">
        <Year year={tile.year} />
      </span>
      <span className="font-headline absolute top-1 left-1.5 text-[0.95rem] leading-none text-foreground [text-shadow:0_1px_8px_rgb(0_0_0/0.85)] max-[479px]:hidden">
        {tile.year}
      </span>
      {tile.tag && (
        <span className="font-label absolute top-1 right-1 rounded-xs bg-foreground px-1 pt-[3px] pb-0.5 text-[0.625rem] leading-none font-extrabold tracking-[0.06em] text-background uppercase max-[479px]:hidden">
          {TAG[tile.tag]}
        </span>
      )}
    </Button>
  );
}

function OpenTile({ tile }: { tile: Extract<YearTile, { kind: "open" }> }) {
  const { own, pastPlay, openPick } = useSlotActions();
  const prompt = !own
    ? "Open"
    : tile.fits
      ? `${tile.fits} is In Progress and fits here`
      : tile.thisYear
        ? "Opened 1 Jan"
        : pastPlay
          ? "Pick a past game"
          : "Open";
  const face = (
    <span
      data-slot="year-tile"
      data-variant="open"
      data-fits={(own && tile.fits) || undefined}
      className={cn(
        "flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-sm border-[1.5px] border-dashed p-1.5 text-center",
        own && tile.fits ? "border-(--challenge-tint-hi)" : "border-border-strong",
      )}
    >
      <b className="font-headline text-[0.85rem] leading-none font-normal text-(--challenge-tint-hi) sm:text-[1.75rem]">
        <Year year={tile.year} />
      </b>
      <small title={prompt} className="line-clamp-5 text-[0.72rem] leading-[1.25] text-dim-foreground max-sm:hidden">{prompt}</small>
    </span>
  );
  if (!pastPlay) {
    return (
      <span role="img" aria-label={`${tile.year}: open${own && tile.fits ? `. ${prompt}` : ""}`}>
        {face}
      </span>
    );
  }
  return (
    <Button
      type="button"
      variant="pool-tile"
      size="bare"
      aria-label={`${tile.year}: open. Pick a past game for it${tile.fits ? `. ${prompt}` : ""}`}
      onClick={() => openPick(tile.year)}
      className="block w-full"
    >
      {face}
    </Button>
  );
}
