import { ArrowRight } from "lucide-react";
import type { JournalEntry } from "@/lib/api/types";
import { chapterHref, journalDateRange, romanNumeral } from "@/lib/journals";
import { MemberAvatar } from "@/components/issue/member-cover";
import { JournalFolio, JournalPage, JournalRunningHead } from "@/components/journal/journal-book";
import { JournalEntryView } from "@/components/journal/journal-entry";
import type { PlateLine } from "@/components/journal/game-journal-plate";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The reader beside the chronology plate: the picked member's entries on
// this game from the picked one back (a few lines each), and the way on to
// their whole chapter.
export function GameJournalReader({
  gameId,
  line,
  lineIndex,
  from,
  shown,
  numbered,
}: {
  gameId: number;
  line: PlateLine;
  lineIndex: number;
  // Where the shown entries start in the member's entries (newest first).
  from: number;
  shown: JournalEntry[];
  numbered: boolean;
}) {
  return (
    <JournalPage
      as="section"
      side="right"
      aria-label={`${line.name}'s chapter`}
      className="px-4 pb-4 sm:px-7"
    >
      <JournalRunningHead
        parts={[`Chapter ${romanNumeral(lineIndex + 1)}`, line.name]}
        note={`${line.count} ${line.count === 1 ? "entry" : "entries"}`}
      />
      <div className="mt-4 mb-0.5 flex items-center gap-2.5">
        <MemberAvatar userId={line.userId} name={line.name} className="size-8" fallbackClassName="text-sm" />
        <h3 className="font-headline min-w-0 truncate text-[1.6rem] leading-[0.9]">{line.name}</h3>
      </div>
      <p className="mb-3 text-[0.88rem] text-faint-foreground">
        {journalDateRange(line.firstAt, line.lastAt)} · newest first
      </p>
      <div className="border-t-2 border-foreground">
        {shown.map((entry, i) => (
          <JournalEntryView
            key={entry.entry_id}
            entry={entry}
            number={numbered ? line.count - from - i : null}
            selected={i === 0}
            clamp={i === 0 ? 3 : 2}
            className={cn("py-3", i > 0 && "border-t border-border")}
          />
        ))}
      </div>
      <JournalFolio
        action={
          <ButtonLink
            href={chapterHref(line.userId, gameId)}
            variant="outline"
            size="sm"
          >
            Read {line.name}&apos;s chapter
            <ArrowRight aria-hidden />
          </ButtonLink>
        }
      >
        <span>
          {numbered
            ? `Entries ${line.count - from}${shown.length > 1 ? `–${line.count - from - shown.length + 1}` : ""} of ${line.count}`
            : `${shown.length} of ${line.count} entries`}
        </span>
      </JournalFolio>
    </JournalPage>
  );
}
