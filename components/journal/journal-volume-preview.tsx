import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { JournalContributor, JournaledGame } from "@/lib/api/types";
import { chapterHref, journalDate } from "@/lib/journals";
import { memberName } from "@/lib/achievements";
import { GameCover } from "@/components/issue/game-cover";
import { MemberAvatar } from "@/components/issue/member-cover";
import { ButtonLink } from "@/components/ui/button";

const PREVIEW_GAMES = 5;

// The pulled volume's title page: the member, their totals and the games
// they last wrote about, each opening that chapter.
export function JournalVolumePreview({
  contributor,
  games,
}: {
  contributor: JournalContributor;
  // Newest chapter first; null when the read failed.
  games: JournaledGame[] | null;
}) {
  const name = memberName(contributor);
  const rows = (games ?? []).filter((g) => g.game).slice(0, PREVIEW_GAMES);
  const rest = Math.max(0, contributor.game_count - rows.length);
  return (
    <aside
      aria-label={`${name}'s volume`}
      className="flex min-w-0 flex-col rounded-md bg-card px-4.5 pt-4 pb-3.5"
    >
      <div className="flex items-center gap-3 border-b-2 border-foreground pb-2.5">
        <MemberAvatar userId={contributor.user_id} name={name} className="size-11" fallbackClassName="text-base" />
        <div className="min-w-0">
          <h3 className="font-headline truncate text-[1.6rem] leading-[0.9]">{name}</h3>
          <small className="font-label mt-1 block text-[0.76rem] tracking-[0.08em] text-faint-foreground">
            {contributor.game_count} {contributor.game_count === 1 ? "game" : "games"} ·{" "}
            {contributor.entry_count} {contributor.entry_count === 1 ? "entry" : "entries"}
          </small>
        </div>
      </div>
      {games === null ? (
        <p className="py-4 text-sm text-faint-foreground">Their chapters couldn&apos;t be loaded right now.</p>
      ) : (
        <ul className="mt-1">
          {rows.map((row) => (
            <li key={row.game!.game_id} className="border-b border-border">
              <Link
                href={chapterHref(contributor.user_id, row.game!.game_id)}
                className="group flex items-center gap-2.5 py-1.5 text-[0.92rem]"
              >
                <GameCover
                  title={row.game!.title}
                  coverUrl={row.game!.cover_url}
                  className="w-[18px] rounded-[1.5px]"
                  fallbackClassName="p-0 text-[0px]"
                />
                <span className="min-w-0 flex-1 truncate group-hover:text-highlight">
                  {row.game!.title}
                </span>
                <span className="text-[0.82rem] text-faint-foreground">{journalDate(row.last_entry_at)}</span>
                <b className="font-headline w-[22px] text-right text-[1.05rem] font-normal">
                  {row.entry_count}
                </b>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2.5">
        {rest > 0 && (
          <span className="font-label text-[0.76rem] tracking-[0.08em] text-faint-foreground">
            +{rest} more {rest === 1 ? "game" : "games"}
          </span>
        )}
        <ButtonLink
          href={`/members/${contributor.user_id}/journal`}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          Open {name}&apos;s journal
          <ArrowRight aria-hidden />
        </ButtonLink>
      </div>
    </aside>
  );
}
