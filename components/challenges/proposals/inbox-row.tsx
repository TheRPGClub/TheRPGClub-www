import Link from "next/link";
import type { ChallengePoolGame } from "@/lib/challenges/types";
import { GameCover } from "@/components/issue/game-cover";

// One row of the Proposals view (pick 9A): the cover, the game in Anton with
// a line under it, and the row's buttons at its right (under it on a
// phone). A rule parts the rows.
export function InboxRow({
  game,
  title,
  meta,
  note,
  actions,
}: {
  game: ChallengePoolGame;
  title?: React.ReactNode;
  meta: React.ReactNode;
  note?: string | null;
  actions?: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-3 border-b border-border py-3 sm:grid-cols-[56px_minmax(0,1fr)_auto]">
      <Link
        href={`/games/${game.game_id}`}
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-highlight"
      >
        <GameCover title={game.title} coverUrl={game.cover_url} alt={game.title} className="w-full" fallbackClassName="p-1 text-[0.6rem]" />
      </Link>
      <div className="min-w-0">
        <p className="font-headline text-[1.3rem] leading-none text-balance break-words">{title ?? game.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.88rem] text-dim-foreground">{meta}</div>
        {note && (
          <p className="mt-2 max-w-[65ch] border-l border-border-strong pl-2.5 text-[0.92rem] leading-[1.45] text-foreground">
            {note}
          </p>
        )}
      </div>
      {actions && (
        <div className="col-span-2 flex flex-wrap gap-1.5 sm:col-span-1 sm:justify-end">{actions}</div>
      )}
    </li>
  );
}
