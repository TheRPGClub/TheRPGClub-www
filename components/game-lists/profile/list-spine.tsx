import Link from "next/link";
import { Lock } from "lucide-react";
import type { GameList } from "@/lib/game-lists/types";
import { updatedText } from "@/lib/game-lists/text";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

// A Game List as a box set on the profile's shelf: a fat spine as wide as
// the list is long, its first cover at the head, the name set sideways, and
// the count and order at the foot. Bindings take turns in the page's own
// inks; a Private list is a dashed spine on the ground. It lifts like the
// bookcase's spines, its paper tag (SpineLiftRow) saying how many games,
// the name and when it last changed, and opens the list.

const BINDINGS = [
  "bg-foreground text-background",
  "bg-muted text-foreground shadow-[inset_0_0_0_1px_rgb(244_244_240/0.12),inset_-6px_0_10px_-6px_rgb(0_0_0/0.5)]",
  "bg-border-strong text-foreground shadow-[inset_-6px_0_10px_-6px_rgb(0_0_0/0.5)]",
];
const SHORT_SORT = { ranked: "Ranked", alphabetical: "A to Z", added: "Added" } as const;

// Width grows with the list (capped so a 500-game list can't swallow the
// shelf); height is a stable, slightly uneven pick from the id, in the
// bookcase spines' range. Decorative only.
export function spineSize(list: Pick<GameList, "id" | "entry_count">): { width: number; height: number } {
  return { width: Math.min(108, 64 + Math.round(list.entry_count * 1.6)), height: 222 + ((list.id * 37) % 24) };
}

export function ListSpine({ list, index, now }: { list: GameList; index: number; now: Date }) {
  const priv = list.visibility === "private";
  const { width, height } = spineSize(list);
  const first = list.preview_games[0];
  const games = `${list.entry_count} ${list.entry_count === 1 ? "game" : "games"}`;
  return (
    <Link
      href={`/lists/${list.id}`}
      aria-label={`${list.name}, ${games}${priv ? ", Private" : ""}`}
      data-spine=""
      data-lift-hours={games}
      data-lift-title={list.name}
      data-lift-sub={`${SHORT_SORT[list.sort]} · Updated ${updatedText(list.updated_at, now)}`}
      style={{ width: `calc(${width}px * var(--spine-scale, 1))`, height: `calc(${height}px * var(--spine-scale, 1))` }}
      className={cn(
        "relative flex shrink-0 flex-col items-center gap-2 self-end rounded-t-sm pt-3 pb-2.5 outline-highlight duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-2 data-lifted:shadow-[0_12px_30px_rgb(0_0_0/0.5)] motion-safe:transition-transform motion-safe:hover:-translate-y-3.5 motion-safe:focus-visible:-translate-y-3.5 motion-safe:data-lifted:-translate-y-3.5 max-sm:[--spine-scale:0.8]",
        priv ? "bg-background text-dim-foreground shadow-[inset_0_0_0_1.5px_var(--color-border-strong)]" : BINDINGS[index % BINDINGS.length],
      )}
    >
      {priv && (
        <>
          <span aria-hidden className="pointer-events-none absolute inset-1 rounded-t-xs border border-b-0 border-dashed border-border-strong" />
          <span className="font-label absolute -top-2.5 left-1/2 z-[1] inline-flex -translate-x-1/2 -rotate-4 items-center gap-0.5 rounded-xs bg-foreground px-1.5 pt-1 pb-0.5 text-[0.66rem] font-extrabold tracking-[0.07em] whitespace-nowrap text-background">
            <Lock aria-hidden className="size-2.5" />
            Private
          </span>
        </>
      )}
      {first && <GameCover title={first.title} coverUrl={first.cover_url} className="w-9 rounded-[1.6px]" fallbackClassName="hidden" />}
      <span className="font-headline min-h-0 flex-1 rotate-180 overflow-hidden text-[1.2rem] leading-none text-ellipsis whitespace-nowrap [writing-mode:vertical-rl]">
        {list.name}
      </span>
      <span aria-hidden className="h-px w-[70%] bg-current opacity-60" />
      <span className="font-headline text-[1.35rem] leading-[0.9]">
        {list.entry_count}
        <small className="font-label mt-0.5 block text-center text-[0.6rem] font-extrabold tracking-[0.08em] opacity-80">
          {SHORT_SORT[list.sort]}
        </small>
      </span>
    </Link>
  );
}
