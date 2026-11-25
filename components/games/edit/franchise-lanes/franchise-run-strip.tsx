"use client";

import { useLayoutEffect, useRef } from "react";
import { placeSentence, type CardRun, type RunTile } from "@/lib/games/game-edit/franchise-card";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

// A context card's run (design pick edit-cards): the Franchise's games in the
// lane's role as a strip of covers over their years, this game ringed in
// yellow where it sits, or ringed dashed where a save will land it. On a
// narrow card the strip scrolls sideways, opened on this game.
export function FranchiseRunStrip({ run, franchise, title }: { run: CardRun; franchise: string; title: string }) {
  const strip = useRef<HTMLOListElement>(null);
  const mine = useRef<HTMLLIElement>(null);
  const meIndex = run.tiles.findIndex((t) => t.me);

  useLayoutEffect(() => {
    const ol = strip.current;
    const li = mine.current;
    if (!ol || !li || ol.scrollWidth <= ol.clientWidth) return;
    ol.scrollLeft = li.offsetLeft - ol.offsetLeft - (ol.clientWidth - li.clientWidth) / 2;
  }, [meIndex, run.total]);

  return (
    <div className="px-4 pt-3.5 pb-3 sm:px-5">
      <p className="mb-3 flex flex-wrap justify-between gap-x-4 gap-y-1">
        <span className="font-label text-[0.78rem] font-bold tracking-[0.08em]">{run.label}</span>
        <span className="font-label text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">
          {run.landing ? `Where ${title} will land` : `Where ${title} sits`}
        </span>
      </p>
      <ol
        ref={strip}
        aria-label={`${run.label}, in ${franchise}`}
        className="-mx-1 flex items-start gap-3 overflow-x-auto overscroll-x-contain px-1 pt-1.5 pb-1.5 [scrollbar-width:thin]"
      >
        {run.before > 0 && <More count={run.before} side="earlier" />}
        {run.tiles.map((t) => (
          <Tile key={t.game_id} tile={t} run={run} ref={t.me ? mine : undefined} />
        ))}
        {run.after > 0 && <More count={run.after} side="later" />}
      </ol>
    </div>
  );
}

function Tile({ tile, run, ref }: { tile: RunTile; run: CardRun; ref?: React.Ref<HTMLLIElement> }) {
  const year = tile.release_year ?? "TBA";
  return (
    <li ref={ref} className={cn("flex-none text-center", tile.me ? "w-24" : "w-[3.9rem]")} aria-current={tile.me ? "true" : undefined}>
      <GameCover
        title={tile.title}
        coverUrl={tile.cover_url}
        alt={tile.me ? "" : tile.title}
        className={cn(
          "mx-auto w-[3.9rem]",
          tile.me && "outline-2 outline-offset-[3px] outline-highlight",
          tile.me && run.landing && "outline-dashed",
        )}
        fallbackClassName="p-1 text-[0.55rem]"
      />
      <span
        aria-hidden={tile.me || undefined}
        className={cn(
          "font-label mt-2 block text-[0.72rem] font-bold tracking-[0.08em] whitespace-nowrap",
          tile.me ? "text-highlight" : "text-faint-foreground",
        )}
      >
        {tile.me ? `${run.landing ? "Lands here" : "This game"} · ${year}` : year}
      </span>
      {tile.me && (
        <span className="sr-only">
          {tile.title}, {year}. {placeSentence(run)}
        </span>
      )}
    </li>
  );
}

function More({ count, side }: { count: number; side: "earlier" | "later" }) {
  return (
    <li className="font-label grid aspect-[3/4] w-[3.9rem] flex-none place-items-center rounded-sm border border-dashed border-border-strong px-1 text-center text-[0.72rem] leading-tight font-bold tracking-[0.06em] text-faint-foreground">
      {count} {side}
    </li>
  );
}
