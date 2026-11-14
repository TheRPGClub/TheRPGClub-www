import Link from "next/link";
import type { GameSummary } from "@/lib/api/types";
import { GameCover, GameHeadline } from "@/components/issue/game-cover";
import { ChapterMarks } from "@/components/journal/chapter-marks";

// The open chapter's head: the game's cover and headline (each opening the
// game), its entry count and span, and the marks it carries.
export function JournalChapterHead({
  chapterLabel,
  game,
  count,
  span,
  nowPlaying,
  completed,
}: {
  chapterLabel: string;
  game: GameSummary;
  count: number;
  span: string | null;
  nowPlaying: boolean;
  completed: boolean;
}) {
  return (
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
  );
}
