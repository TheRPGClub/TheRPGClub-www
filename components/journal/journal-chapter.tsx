import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { GameSummary, JournalEntryUser } from "@/lib/api/types";
import { entryNumber, isJournalOwner, journalDateRange } from "@/lib/journals";
import { GameCover, GameHeadline } from "@/components/issue/game-cover";
import {
  ChapterMarks,
  JournalFolio,
  JournalPage,
  JournalRunningHead,
} from "@/components/journal/journal-book";
import { JournalEntryView } from "@/components/journal/journal-entry";
import { JournalCompose, JournalOwnerEntry } from "@/components/journal/journal-owner-entry";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The open chapter: one member's entries on one game, newest first, under the
// game's headline, its span and its marks. The owner writes the next entry at
// the top of the first page and edits their own in place.
export function JournalChapter({
  chapterLabel,
  game,
  entries,
  count,
  page,
  pages,
  per,
  firstEntryAt,
  lastEntryAt,
  nowPlaying,
  completed,
  viewerId,
  ownerId,
  composeLabel,
  pageHref,
}: {
  // "Chapter I", or "New chapter" before the first entry.
  chapterLabel: string;
  game: GameSummary;
  entries: JournalEntryUser[];
  count: number;
  page: number;
  pages: number;
  per: number;
  firstEntryAt: string | null;
  lastEntryAt: string | null;
  nowPlaying: boolean;
  completed: boolean;
  viewerId: string | null;
  ownerId: string;
  // "Entry 10 · Nov 2, 2026" for the owner's next entry.
  composeLabel: string;
  pageHref: (page: number) => string;
}) {
  const isOwner = viewerId === ownerId;
  const span = journalDateRange(firstEntryAt, lastEntryAt);
  const editorGame = { game_id: game.game_id, title: game.title, cover_url: game.cover_url ?? null };

  return (
    <JournalPage
      as="section"
      side="right"
      aria-labelledby="journal-chapter-title"
      className="px-4 pb-4 sm:px-7.5"
    >
      <JournalRunningHead
        parts={[chapterLabel, game.title]}
        note={count > 0 ? "Newest first" : undefined}
      />
      <header className="flex items-end gap-4.5 border-b-2 border-foreground pt-4 pb-3.5">
        <Link href={`/games/${game.game_id}`} className="shrink-0" tabIndex={-1} aria-hidden>
          <GameCover
            title={game.title}
            coverUrl={game.cover_url}
            className="w-[62px]"
            fallbackClassName="p-1 text-[9px]"
          />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/games/${game.game_id}`}
            className="transition-colors hover:text-highlight"
          >
            <GameHeadline
              as="h2"
              title={game.title}
              className="text-[1.9rem] leading-[0.9] sm:text-[2.4rem]"
            />
          </Link>
          <span id="journal-chapter-title" className="sr-only">
            {chapterLabel}: {game.title}
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[0.82rem] text-faint-foreground">
              {count} {count === 1 ? "entry" : "entries"}
              {span && ` · ${span}`}
            </span>
            <ChapterMarks nowPlaying={nowPlaying} completed={completed} />
          </div>
        </div>
      </header>

      <div className="mt-3.5 flex flex-col gap-3.5">
        {isOwner && page === 1 && (
          <JournalCompose
            userId={ownerId}
            game={editorGame}
            chapterGameId={game.game_id}
            label={composeLabel}
          />
        )}
        {entries.length === 0 && (
          <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-sm text-faint-foreground">
            {isOwner
              ? "No entries on this game yet. The first one opens the chapter."
              : "No entries on this game."}
          </p>
        )}
        {entries.map((entry, i) => {
          const number = entryNumber(count, page, per, i);
          return isJournalOwner(entry, viewerId) ? (
            <JournalOwnerEntry
              key={entry.entry_id}
              entry={entry}
              number={number}
              game={editorGame}
              className={cn(i > 0 && "border-t border-border pt-3")}
            />
          ) : (
            <JournalEntryView
              key={entry.entry_id}
              entry={entry}
              number={number}
              className={cn(i > 0 && "border-t border-border pt-3")}
            />
          );
        })}
      </div>

      {pages > 1 && (
        <JournalFolio
          page={page}
          className="pt-4"
          action={
            <>
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <ArrowLeft aria-hidden />
                  Newer entries
                </Link>
              )}
              {page < pages && (
                <Link
                  href={pageHref(page + 1)}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Older entries
                  <ArrowRight aria-hidden />
                </Link>
              )}
            </>
          }
        >
          <span>of {pages} pages</span>
        </JournalFolio>
      )}
    </JournalPage>
  );
}
