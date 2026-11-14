import Link from "next/link";
import type { JournalEntryGameUser } from "@/lib/api/types";
import { chapterHref, highlightRuns, journalDate, searchSnippet } from "@/lib/journals";
import { memberName } from "@/lib/achievements";
import { GameCover } from "@/components/issue/game-cover";
import { MemberAvatar } from "@/components/issue/member-cover";

function Marked({ text, q }: { text: string; q: string }) {
  return (
    <>
      {highlightRuns(text, q).map((run, i) =>
        run.hit ? (
          <mark key={i} className="rounded-[2px] bg-highlight/22 px-0.5 text-foreground">
            {run.text}
          </mark>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </>
  );
}

const TH =
  "font-label border-b-2 border-foreground pr-3.5 pb-2 text-left text-[0.76rem] font-bold tracking-[0.08em] text-faint-foreground";

// The catalogue: every matching entry, newest first, as a back-of-book table
// (date, member, game, the entry with the match marked). On phones each row
// stacks into a card.
export function JournalCatalogue({
  entries,
  q,
}: {
  entries: JournalEntryGameUser[];
  q: string;
}) {
  return (
    <table className="mt-3 w-full border-collapse max-md:block">
      <thead className="max-md:hidden">
        <tr>
          <th scope="col" className={TH}>Date</th>
          <th scope="col" className={TH}>Member</th>
          <th scope="col" className={TH}>Game</th>
          <th scope="col" className={TH}>Entry</th>
        </tr>
      </thead>
      <tbody className="max-md:block max-md:border-t-2 max-md:border-foreground">
        {entries.map((entry) => {
          const name = entry.user ? memberName(entry.user) : "Member";
          const title = entry.game?.title ?? "Unknown game";
          return (
            <tr
              key={entry.entry_id}
              className="border-b border-border align-top text-[0.92rem] transition-colors hover:bg-card max-md:grid max-md:grid-cols-[auto_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-1.5 max-md:py-3"
            >
              <td className="font-label py-2.5 pr-3.5 tracking-[0.06em] whitespace-nowrap md:w-[110px] max-md:p-0">
                <time dateTime={entry.created_at}>{journalDate(entry.created_at, true)}</time>
              </td>
              <td className="py-2.5 pr-3.5 whitespace-nowrap md:w-[150px] max-md:p-0">
                <Link
                  href={`/members/${entry.user_id}/journal`}
                  className="font-label flex w-fit max-w-full items-center gap-2 tracking-[0.06em] hover:text-highlight"
                >
                  <MemberAvatar userId={entry.user_id} name={name} className="size-6" fallbackClassName="text-xs" />
                  <span className="truncate">{name}</span>
                </Link>
              </td>
              <td className="py-2.5 pr-3.5 md:w-[230px] max-md:col-span-2 max-md:p-0">
                <Link
                  href={`/games/${entry.gamedb_game_id}`}
                  className="flex w-fit max-w-full items-center gap-2 hover:text-highlight"
                >
                  <GameCover
                    title={title}
                    coverUrl={entry.game?.cover_url}
                    className="w-4 rounded-[1.5px]"
                    fallbackClassName="p-0 text-[0px]"
                  />
                  <span className="truncate">{title}</span>
                </Link>
              </td>
              <td className="py-2.5 text-dim-foreground max-md:col-span-2 max-md:p-0">
                <Link
                  href={chapterHref(entry.user_id, entry.gamedb_game_id)}
                  className="block hover:text-foreground"
                >
                  {entry.entry_title && (
                    <span className="mr-1.5 text-[0.95rem] font-semibold text-foreground italic">
                      <Marked text={entry.entry_title} q={q} />
                    </span>
                  )}
                  <Marked text={searchSnippet(entry.entry_body, q)} q={q} />
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
