import Link from "next/link";
import { Shuffle } from "lucide-react";
import { parseHltbHours } from "@/lib/hltb";
import { readBacklogPick } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { GameCover, GameHeadline } from "@/components/issue/game-cover";
import { PanelEmpty, PanelError } from "./panel-states";
import { gameHref } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Backlog Pick: one game drawn from the member's backlog, set like a small
// cover story (its cover, its two-line headline, how long it takes), with
// "Pick another" on the picker page.
export async function BacklogPickBody({ viewer }: BodyProps) {
  const read = await readBacklogPick(viewer.id);
  if (!read) return <PanelError title={PANELS.backlog_pick.title} />;
  const pick = read.data;
  if (!pick) return <PanelEmpty />;

  const { game } = pick;
  const year = game.initial_release_date?.slice(0, 4);
  const platform = pick.platform?.platform_abbreviation || pick.platform?.platform_name;
  const hours = pick.hours ?? parseHltbHours(pick.hltb?.main);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 pt-1 pb-2.5">
      <Link href={gameHref(game.game_id)} className="block">
        <GameCover title={game.title} coverUrl={game.cover_url} className="w-21" fallbackClassName="p-1.5 text-sm" />
      </Link>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <Link href={gameHref(game.game_id)} className="transition-colors hover:text-highlight">
          <GameHeadline as="p" title={game.title} className="text-[1.6rem] leading-[0.92]" />
        </Link>
        {(year || platform) && (
          <span className="flex flex-wrap gap-1.5">
            {year && <Badge size="sm">{year}</Badge>}
            {platform && <Badge size="sm">{platform}</Badge>}
          </span>
        )}
        {hours != null && (
          <p className="flex flex-col gap-0.5">
            <b className="font-headline text-lg leading-none font-normal">About {Math.round(hours)} hours</b>
            <span className="font-label text-[0.7rem] font-bold tracking-[0.06em] text-faint-foreground">
              To beat · HowLongToBeat
            </span>
          </p>
        )}
        <ButtonLink href={`/members/${viewer.id}/backlogged-games/pick`} variant="outline" size="sm">
          <Shuffle aria-hidden />
          Pick another
        </ButtonLink>
      </div>
    </div>
  );
}
