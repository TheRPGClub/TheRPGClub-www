import { ageLabel } from "@/lib/dashboard/panel-items";
import { readClubCompletions, readMyCompletions, type PanelCompletion } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { MONTHS, utcDay } from "@/lib/releases";
import { MetaParts, PanelItem, PanelWhen } from "./panel-list";
import { gameHref, listBody, memberOf, RowCover } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Recent Completions: the club's newest (by the day each game was
// finished, undated ones last) and the member's own.

// When it was finished: "2h" for a fresh one, else the day; a Completion
// with no date says nothing.
function finished(completion: PanelCompletion, now: number): string | null {
  if (!completion.completed_at) return null;
  if (completion.completed_at.length > 10) return ageLabel(completion.completed_at, now);
  const d = utcDay(completion.completed_at);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

function playtime(completion: PanelCompletion): string | null {
  const hours = completion.final_playtime_hrs;
  return hours != null && hours > 0 ? `${Math.round(hours)}h` : null;
}

function CompletionRow({ completion, club, now }: { completion: PanelCompletion; club: boolean; now: number }) {
  const { game } = completion;
  const member = club && completion.user ? memberOf(completion.user) : null;
  const when = finished(completion, now);
  return (
    <PanelItem
      media={<RowCover title={game.title} coverUrl={game.cover_url} member={member ?? undefined} />}
      title={game.title}
      href={gameHref(game.game_id)}
      meta={<MetaParts parts={[member && <b>{member.name}</b>, completion.completion_type, playtime(completion)]} />}
      aside={when && <PanelWhen>{when}</PanelWhen>}
    />
  );
}

export async function CompletionsClubBody({ wide }: BodyProps) {
  const completions = await readClubCompletions();
  const now = Date.now();
  return listBody({
    rows: completions,
    title: PANELS.completions_club.title,
    wide,
    row: (c) => <CompletionRow key={c.completion_id} completion={c} club now={now} />,
  });
}

export async function CompletionsMineBody({ viewer, wide }: BodyProps) {
  const completions = await readMyCompletions(viewer.id);
  const now = Date.now();
  return listBody({
    rows: completions,
    title: PANELS.completions_mine.title,
    wide,
    row: (c) => <CompletionRow key={c.completion_id} completion={c} club={false} now={now} />,
  });
}
