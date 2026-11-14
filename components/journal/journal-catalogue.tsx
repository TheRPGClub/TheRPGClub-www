import Link from "next/link";
import type { JournalEntryGameUser } from "@/lib/api/types";
import { chapterHref, highlightRuns, journalDate, searchSnippet } from "@/lib/journals";
import { memberName } from "@/lib/achievements";
import { GameCover } from "@/components/issue/game-cover";
import { MemberAvatar } from "@/components/issue/member-cover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const TH = "h-auto px-0 pr-3.5 pb-2 text-[0.76rem]";

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
    <Table variant="index" className="mt-3 border-collapse text-base max-md:block">
      <TableHeader className="max-md:hidden">
        <TableRow>
          <TableHead scope="col" className={TH}>Date</TableHead>
          <TableHead scope="col" className={TH}>Member</TableHead>
          <TableHead scope="col" className={TH}>Game</TableHead>
          <TableHead scope="col" className={TH}>Entry</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="max-md:block">
        {entries.map((entry) => {
          const name = entry.user ? memberName(entry.user) : "Member";
          const title = entry.game?.title ?? "Unknown game";
          return (
            <TableRow
              key={entry.entry_id}
              className="align-top text-[0.92rem] max-md:grid max-md:grid-cols-[auto_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-1.5 max-md:py-3"
            >
              <TableCell className="font-label p-0 py-2.5 pr-3.5 align-top tracking-[0.06em] md:w-[110px] max-md:p-0">
                <time dateTime={entry.created_at}>{journalDate(entry.created_at, true)}</time>
              </TableCell>
              <TableCell className="p-0 py-2.5 pr-3.5 align-top md:w-[150px] max-md:p-0">
                <Link
                  href={`/members/${entry.user_id}/journal`}
                  className="font-label flex w-fit max-w-full items-center gap-2 tracking-[0.06em] hover:text-highlight"
                >
                  <MemberAvatar userId={entry.user_id} name={name} className="size-6" fallbackClassName="text-xs" />
                  <span className="truncate">{name}</span>
                </Link>
              </TableCell>
              <TableCell className="p-0 py-2.5 pr-3.5 align-top whitespace-normal md:w-[230px] max-md:col-span-2 max-md:p-0">
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
              </TableCell>
              <TableCell className="p-0 py-2.5 align-top whitespace-normal max-md:col-span-2 max-md:p-0">
                <Link
                  href={chapterHref(entry.user_id, entry.gamedb_game_id)}
                  className="block text-dim-foreground hover:text-foreground"
                >
                  {entry.entry_title && (
                    <span className="mr-1.5 text-[0.95rem] font-semibold text-foreground italic">
                      <Marked text={entry.entry_title} q={q} />
                    </span>
                  )}
                  <Marked text={searchSnippet(entry.entry_body, q)} q={q} />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
