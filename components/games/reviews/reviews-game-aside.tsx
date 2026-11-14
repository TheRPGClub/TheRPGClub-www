import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { GameCover, GameHeadline } from "@/components/issue/game-cover";
import { gameTrack, trackAccentText, trackChips } from "@/components/issue/game-track";

// The reviews list's left column: the game's cover with its win, its title
// and year and platforms, the write-a-review panel, and the way back to the
// game. Sticky beside the list on large screens.
export function ReviewsGameAside({
  gameId,
  game,
  composePanel,
}: {
  gameId: number;
  game: Game;
  composePanel: ReactNode;
}) {
  const track = gameTrack(game);
  const year = game.initial_release_date
    ? new Date(game.initial_release_date).getUTCFullYear()
    : null;
  const meta = [
    year,
    ...(game.platforms ?? [])
      .slice(0, 4)
      .map((p) => p.platform_abbreviation ?? p.platform_code ?? p.platform_name),
  ].filter(Boolean);
  const winChip = trackChips(game, { short: true })[0];

  return (
    <aside
      aria-label={game.title}
      className="grid grid-cols-[5.75rem_1fr] items-center gap-x-3.5 gap-y-4 lg:sticky lg:top-20 lg:block lg:self-start"
    >
      <div className="relative">
        <GameCover
          title={game.title}
          coverUrl={game.cover_url}
          className="rounded-md shadow-[0_18px_40px_rgb(0_0_0/0.5)]"
          fallbackClassName="text-sm lg:text-[2rem]"
        />
        {winChip && (
          <Badge tone={winChip.tone} className="absolute bottom-3 left-3 hidden lg:inline-flex border-0">
            {winChip.label}
          </Badge>
        )}
      </div>
      <div className="min-w-0">
        <GameHeadline
          as="h2"
          title={game.title}
          accentClassName={trackAccentText(track)}
          className="text-[1.75rem] leading-[0.9] lg:mt-4 lg:text-[2.4rem]"
        />
        {meta.length > 0 && (
          <p className="font-label mt-2 text-[0.85rem] tracking-[0.06em] text-faint-foreground">
            {meta.join(" · ")}
          </p>
        )}
      </div>
      {composePanel && (
        <div className="col-span-full lg:mt-4.5">{composePanel}</div>
      )}
      <Link
        href={`/games/${gameId}`}
        className="font-label col-span-full hidden items-center gap-1.5 text-[0.85rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:text-highlight lg:mt-3.5 lg:inline-flex [&_svg]:size-3.5"
      >
        <ArrowLeft aria-hidden />
        Back to the game
      </Link>
    </aside>
  );
}
