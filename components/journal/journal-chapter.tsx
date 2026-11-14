import type { GameSummary, JournalEntryUser } from "@/lib/api/types";
import { entryNumber, isJournalOwner, journalDateRange } from "@/lib/journals";
import { JournalPage, JournalRunningHead } from "@/components/journal/journal-book";
import { JournalPager } from "@/components/journal/journal-pager";
import { JournalEntryView } from "@/components/journal/journal-entry";
import { JournalOwnerEntry } from "@/components/journal/journal-owner-entry";
import { JournalCompose } from "@/components/journal/journal-compose";
import { JournalChapterHead } from "@/components/journal/journal-chapter-head";
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
      <JournalChapterHead
        chapterLabel={chapterLabel}
        game={game}
        count={count}
        span={span}
        nowPlaying={nowPlaying}
        completed={completed}
      />

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

      {pages > 1 && <JournalPager page={page} pages={pages} pageHref={pageHref} />}
    </JournalPage>
  );
}
