import Link from "next/link";
import { Plus } from "lucide-react";
import type { GameSummary } from "@/lib/api/types";
import { chapterHref, journalDate, romanNumeral } from "@/lib/journals";
import { ChapterMarks, JournalPage, JournalRunningHead } from "@/components/journal/journal-book";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface JournalChapterRow {
  game: GameSummary;
  entryCount: number;
  lastEntryAt: string | null;
  nowPlaying: boolean;
  completed: boolean;
}

// The volume's Contents page: one chapter per game, newest first, each a
// dotted leader out to its entry count. The open chapter carries the yellow
// selection ring.
export function JournalContents({
  userId,
  displayName,
  chapters,
  openGameId,
  entryTotal,
  newChapterHref,
}: {
  userId: string;
  displayName: string;
  chapters: JournalChapterRow[];
  openGameId: number | null;
  entryTotal: number;
  // The owner's "start a chapter" link; absent for everyone else.
  newChapterHref?: string;
}) {
  return (
    <JournalPage as="nav" side="left" aria-label="Contents" className="px-4 pb-4.5 sm:px-5.5">
      <JournalRunningHead
        parts={[`${displayName}'s Game Journal`]}
        note={`${chapters.length} ${chapters.length === 1 ? "chapter" : "chapters"} · ${entryTotal} ${entryTotal === 1 ? "entry" : "entries"}`}
      />
      <h2 className="font-headline mt-4.5 mb-2.5 border-b-2 border-foreground pb-2 text-3xl">
        Contents
      </h2>
      {chapters.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-sm text-faint-foreground">
          No chapters yet.
        </p>
      ) : (
        <ol className="-mx-2 max-h-[30rem] overflow-y-auto px-2 lg:max-h-[34rem]">
          {chapters.map((chapter, i) => {
            const on = chapter.game.game_id === openGameId;
            const last = journalDate(chapter.lastEntryAt);
            return (
              <li key={chapter.game.game_id}>
                <Link
                  href={chapterHref(userId, chapter.game.game_id)}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "group grid grid-cols-[34px_minmax(0,1fr)_auto] gap-x-2 rounded-sm py-2 pr-2 pl-1.5 transition-colors focus-visible:ring-3 focus-visible:ring-highlight/50 focus-visible:outline-none",
                    on
                      ? "bg-muted shadow-[inset_0_0_0_1.5px_var(--color-highlight)]"
                      : "hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "font-headline text-[1.15rem] leading-[1.1]",
                      on ? "text-foreground" : "text-faint-foreground",
                    )}
                  >
                    {romanNumeral(i + 1)}
                  </span>
                  <span className="flex min-w-0 items-baseline gap-1.5 after:min-w-3 after:flex-1 after:-translate-y-1 after:border-b-[1.5px] after:border-dotted after:border-border-strong">
                    <span className="font-label truncate text-base tracking-[0.04em] group-hover:text-highlight">
                      {chapter.game.title}
                    </span>
                  </span>
                  <span className="font-headline text-[1.15rem] leading-[1.1]">
                    <span className="sr-only">, </span>
                    {chapter.entryCount}
                    <span className="sr-only"> {chapter.entryCount === 1 ? "entry" : "entries"}</span>
                  </span>
                  <span className="col-start-2 col-end-4 flex flex-wrap items-center gap-2 text-[0.82rem] text-faint-foreground">
                    {last && <span>Last entry {last}</span>}
                    <ChapterMarks
                      nowPlaying={chapter.nowPlaying}
                      completed={chapter.completed}
                      className="h-5 px-1.5 text-[0.72rem]"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
      {newChapterHref && (
        <div className="mt-auto pt-4">
          <Link
            href={newChapterHref}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Plus aria-hidden />
            Start a chapter for another game
          </Link>
        </div>
      )}
    </JournalPage>
  );
}
