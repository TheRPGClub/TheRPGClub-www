import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { GameHeadline } from "@/components/issue/game-cover";
import { trackAccentText, trackChips, type GameTrack } from "@/components/issue/game-track";
import { PlatformPills } from "@/components/platform-pills";

// The cover story's title block: the title in two monumental lines, the chip
// row, and the blurb with the IGDB link inline beside it. On a phone the
// block dissolves into the hero's grid: the title sits beside the cover and
// the rest runs full width under both.
export function GameHeroText({
  game,
  track,
  badge,
}: {
  game: Game;
  track: GameTrack | null;
  badge?: ReactNode;
}) {
  const chips = trackChips(game);
  const hasChips = !!badge || chips.length > 0 || (game.platforms?.length ?? 0) > 0;
  const igdb = game.igdb_url && (
    <a
      href={game.igdb_url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-label mb-0.75 inline-flex flex-none items-center gap-1.5 text-[0.85rem] font-extrabold tracking-[0.08em] text-foreground transition-colors hover:text-highlight"
    >
      IGDB
      <ExternalLink aria-hidden className="size-3.5" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );

  return (
    <div className="min-w-0 max-md:contents md:col-start-2 md:row-start-1">
      <GameHeadline
        title={game.title}
        accentClassName={trackAccentText(track)}
        className="col-start-2 row-start-1 self-center text-[2.3rem] leading-[0.88] md:text-[5rem]"
      />
      {hasChips && (
        <div className="col-span-full flex flex-wrap gap-1.5 md:mt-4">
          {badge}
          {chips.map((chip) => (
            <Badge key={chip.tone} tone={chip.tone} className="border-0">
              {chip.label}
            </Badge>
          ))}
          <PlatformPills platforms={game.platforms} max={5} />
        </div>
      )}
      {(game.description || igdb) && (
        <div className="col-span-full flex max-w-[46rem] items-end gap-3.5 md:mt-3.5">
          {game.description && (
            <p className="line-clamp-3 min-w-0 flex-1 text-[0.9rem] leading-[1.55] text-dim-foreground">
              {game.description}
            </p>
          )}
          {igdb}
        </div>
      )}
    </div>
  );
}
