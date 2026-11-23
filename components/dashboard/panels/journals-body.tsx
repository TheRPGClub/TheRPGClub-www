import { ageLabel } from "@/lib/dashboard/panel-items";
import { readJournals } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { chapterHref } from "@/lib/journals";
import { MetaParts, PanelItem, PanelWhen } from "./panel-list";
import { listBody, memberOf, RowCover } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Game Journals: the club's newest Journal Entries, each under its game with
// its writer on the cover's corner.
export async function JournalsBody({ wide }: BodyProps) {
  const entries = await readJournals();
  const now = Date.now();
  return listBody({
    rows: entries,
    title: PANELS.journals.title,
    wide,
    row: (entry) => {
      const member = memberOf(entry.user);
      const title = entry.entry_title?.trim() || firstLine(entry.entry_body) || entry.game.title;
      return (
        <PanelItem
          key={entry.entry_id}
          media={<RowCover title={entry.game.title} coverUrl={entry.game.cover_url} member={member} />}
          title={title}
          href={chapterHref(entry.user.user_id, entry.game.game_id)}
          meta={<MetaParts parts={[<b key="m">{member.name}</b>, entry.game.title]} />}
          aside={<PanelWhen>{ageLabel(entry.created_at, now)}</PanelWhen>}
        />
      );
    },
  });
}

// An untitled entry reads by its opening words.
function firstLine(body: string): string {
  return body.split("\n").find((line) => line.trim())?.trim().slice(0, 120) ?? "";
}
