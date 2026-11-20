import { ageLabel } from "@/lib/dashboard/panel-items";
import { readClubNowPlaying, readMyNowPlaying, type PanelNowPlaying } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { MONTHS, utcDay } from "@/lib/releases";
import { MetaParts, PanelItem, PanelWhen } from "./panel-list";
import { gameHref, listBody, memberOf, RowCover } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Now Playing: the club's newest (who started what, on which platform) and
// the member's own (since when).

const platformOf = (entry: PanelNowPlaying) =>
  entry.platform?.platform_abbreviation || entry.platform?.platform_name || null;

export async function NowPlayingClubBody({ wide }: BodyProps) {
  const entries = await readClubNowPlaying();
  const now = Date.now();
  return listBody({
    rows: entries?.filter((e) => e.game) ?? null,
    title: PANELS.now_playing_club.title,
    wide,
    row: (entry) => {
      const game = entry.game!;
      const member = entry.user ? memberOf(entry.user) : null;
      return (
        <PanelItem
          key={entry.entry_id}
          media={<RowCover title={game.title} coverUrl={game.cover_url} member={member ?? undefined} />}
          title={game.title}
          href={gameHref(game.game_id)}
          meta={<MetaParts parts={[member && <b>{member.name}</b>, platformOf(entry)]} />}
          aside={<PanelWhen>{ageLabel(entry.added_at, now)}</PanelWhen>}
        />
      );
    },
  });
}

// "since 9 Nov".
function since(iso: string): string {
  const d = utcDay(iso.slice(0, 10));
  return `since ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export async function NowPlayingMineBody({ viewer, wide }: BodyProps) {
  const entries = await readMyNowPlaying(viewer.id);
  return listBody({
    rows: entries?.filter((e) => e.game) ?? null,
    title: PANELS.now_playing_mine.title,
    wide,
    row: (entry) => {
      const game = entry.game!;
      return (
        <PanelItem
          key={entry.entry_id}
          media={<RowCover title={game.title} coverUrl={game.cover_url} />}
          title={game.title}
          href={gameHref(game.game_id)}
          meta={<MetaParts parts={[platformOf(entry), since(entry.added_at)]} />}
        />
      );
    },
  });
}
