import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { GameHeadline } from "@/components/issue/game-cover";
import { trackAccentText, trackChips, type GameTrack } from "@/components/issue/game-track";
import { PlatformPills } from "@/components/platform-pills";

// The cover story's text column: the title in two monumental lines, the
// chip row, the blurb and the IGDB link.
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

  return (
    <div className="col-span-full min-w-0 md:col-span-1 md:row-start-1 md:col-start-2">
      <GameHeadline
        title={game.title}
        accentClassName={trackAccentText(track)}
        className="text-[3.1rem] leading-[0.88] md:text-[5.5rem]"
      />
      {(badge || chips.length > 0 || (game.platforms?.length ?? 0) > 0) && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {badge}
          {chips.map((chip) => (
            <Badge key={chip.tone} tone={chip.tone} className="border-0">
              {chip.label}
            </Badge>
          ))}
          <PlatformPills platforms={game.platforms} max={5} />
        </div>
      )}
      {game.description && (
        <p className="mt-3.5 line-clamp-4 max-w-[60ch] text-[0.9rem] leading-[1.55] text-dim-foreground">
          {game.description}
        </p>
      )}
      {game.igdb_url && (
        <a
          href={game.igdb_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label mt-2.5 inline-flex items-center gap-1.5 text-[0.85rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:text-highlight"
        >
          View on IGDB
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      )}
    </div>
  );
}
