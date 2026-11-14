import { romanNumeral } from "@/lib/journals";
import type { JournalVolumeView } from "@/lib/journals/volume-page";
import { JournalVolume } from "@/components/journal/journal-book";
import { JournalChapter } from "@/components/journal/journal-chapter";
import { JournalContents } from "@/components/journal/journal-contents";
import { JournalNewChapter } from "@/components/journal/journal-new-chapter";

// A member's volume open at a spread: the Contents on the left, the open
// chapter (or a new one) on the right.
export function JournalVolumeSpread({ view }: { view: JournalVolumeView }) {
  const { user, open, openGame, entries, isOwner } = view;
  const base = `/members/${user.user_id}/journal`;
  return (
    <JournalVolume>
      <div className="grid gap-1.5 lg:min-h-[668px] lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-0">
        <JournalContents
          userId={user.user_id}
          displayName={view.displayName}
          chapters={view.chapters}
          openGameId={openGame?.game_id ?? null}
          entryTotal={view.entryTotal}
          newChapterHref={isOwner ? `${base}?new=1` : undefined}
        />
        {openGame && entries ? (
          <JournalChapter
            chapterLabel={open.row ? `Chapter ${romanNumeral(open.index + 1)}` : "New chapter"}
            game={openGame}
            entries={entries.data}
            count={view.count}
            page={entries.meta.page}
            pages={view.pages}
            per={view.per}
            firstEntryAt={view.firstEntryAt}
            lastEntryAt={view.lastEntryAt}
            nowPlaying={view.playingIds.has(openGame.game_id)}
            completed={view.completedIds.has(openGame.game_id)}
            viewerId={view.viewerId}
            ownerId={user.user_id}
            composeLabel={`Entry ${view.count + 1} · ${view.today}`}
            pageHref={(p) => `${base}?game=${openGame.game_id}${p > 1 ? `&page=${p}` : ""}`}
          />
        ) : (
          <JournalNewChapter
            userId={user.user_id}
            isOwner={isOwner}
            notFound={Boolean(open.gameId && !openGame)}
            today={view.today}
          />
        )}
      </div>
    </JournalVolume>
  );
}
