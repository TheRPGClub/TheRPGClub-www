import type { UpcomingRelease } from "@/lib/api/types";
import { releaseDateBlock, releasePlatforms } from "@/lib/dashboard/panel-items";
import { readReleases } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { upcomingReleaseKey } from "@/lib/release-calendar";
import { cn } from "@/lib/utils";
import { PanelItem } from "./panel-list";
import { gameHref, listBody, RowCover } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Upcoming Releases: each game's next release from today (`per_game=next`),
// on the platforms the member hasn't hidden (the API leaves those out).
export async function ReleasesBody({ viewer, wide }: BodyProps) {
  const releases = await readReleases(viewer.id);
  return listBody({
    rows: releases,
    title: PANELS.releases.title,
    wide,
    row: (upcoming) => (
      <PanelItem
        key={upcomingReleaseKey(upcoming)}
        media={
          <span className="flex items-center gap-2.5">
            <DateBlock upcoming={upcoming} />
            <RowCover title={upcoming.game.title} coverUrl={upcoming.game.cover_url} width={36} />
          </span>
        }
        title={upcoming.game.title}
        href={gameHref(upcoming.game.game_id)}
        meta={releasePlatforms(upcoming)}
      />
    ),
  });
}

// The day in Anton over "Nov · Thu"; a vague date as what is known over
// the dashed chip saying what isn't ("Dec" over "Day TBA").
function DateBlock({ upcoming }: { upcoming: UpcomingRelease }) {
  const block = releaseDateBlock(upcoming);
  return (
    <span className="flex w-12 shrink-0 flex-col items-center gap-1">
      <b className={cn("font-headline leading-[0.85] font-normal", block.vague ? "text-xl" : "text-[1.65rem]")}>
        {block.big}
      </b>
      <span
        className={cn(
          "font-label text-[0.68rem] leading-none font-bold tracking-[0.06em] whitespace-nowrap text-faint-foreground",
          block.vague && "rounded-xs px-1 py-0.5 text-dim-foreground outline-[1.5px] -outline-offset-[1.5px] outline-faint-foreground outline-dashed",
        )}
      >
        {block.small}
      </span>
    </span>
  );
}
