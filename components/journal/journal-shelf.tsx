import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import type { JournalContributor, JournaledGame } from "@/lib/api/types";
import { chapterHref, journalDate, memberInk, spineHeight } from "@/lib/journals";
import { memberName } from "@/lib/achievements";
import { GameCover } from "@/components/issue/game-cover";
import { MemberAvatar } from "@/components/issue/member-cover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// /journals' archive: one volume per member standing on a shelf, most games
// journaled first. The pulled volume stands proud with the selection ring;
// the rest lift a little on hover.
export function JournalShelf({
  contributors,
  pulledId,
  hrefFor,
  more,
}: {
  contributors: JournalContributor[];
  pulledId: string | null;
  hrefFor: (userId: string) => string;
  // The closing "N more volumes" spine, when the shelf is cut short.
  more?: { count: number; href: string };
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pt-5 sm:mx-0 sm:px-0">
      <ul
        aria-label="Member volumes"
        className="flex h-[262px] min-w-max items-end gap-1.5 border-b-[6px] border-rule px-3 shadow-[0_10px_18px_-10px_rgb(0_0_0/0.8)]"
      >
        {contributors.map((c) => {
          const name = memberName(c);
          const on = c.user_id === pulledId;
          return (
            <li key={c.user_id}>
              <Link
                href={hrefFor(c.user_id)}
                aria-current={on ? "true" : undefined}
                aria-label={`${name}: ${c.entry_count} ${c.entry_count === 1 ? "entry" : "entries"} on ${c.game_count} ${c.game_count === 1 ? "game" : "games"}`}
                style={
                  { "--ink": memberInk(c.user_id), height: spineHeight(c.user_id) } as CSSProperties
                }
                className={cn(
                  "group relative flex w-14 flex-col items-center rounded-t-sm pb-2.5 transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:ring-3 focus-visible:ring-highlight/60 focus-visible:outline-none",
                  on
                    ? "-translate-y-[18px] bg-ink-2 shadow-[inset_0_0_0_1.5px_var(--color-highlight),0_12px_30px_rgb(0_0_0/0.5)]"
                    : "bg-ink-3 shadow-[inset_0_0_0_1px_rgb(244_244_240/0.08)] motion-safe:hover:-translate-y-1.5",
                )}
              >
                <span aria-hidden className="mb-2.5 h-2 w-full rounded-t-sm bg-(--ink)" />
                <span
                  aria-hidden
                  className="font-label max-h-[calc(100%-82px)] truncate text-[0.95rem] font-extrabold tracking-[0.06em] [writing-mode:vertical-rl] rotate-180 group-hover:text-highlight"
                >
                  {name}
                </span>
                <span aria-hidden className="font-headline mt-auto text-center text-[1.35rem] leading-none">
                  {c.entry_count}
                  <small className="font-label mt-0.5 block text-[0.72rem] tracking-[0.08em] text-paper-mute">
                    Entries
                  </small>
                </span>
              </Link>
            </li>
          );
        })}
        {more && more.count > 0 && (
          <li>
            <Link
              href={more.href}
              className="flex h-[180px] w-14 items-center justify-center rounded-t-sm shadow-[inset_0_0_0_1px_var(--color-rule-strong)] transition-colors hover:bg-ink-3 focus-visible:ring-3 focus-visible:ring-highlight/60 focus-visible:outline-none"
            >
              <span className="font-label text-[0.95rem] font-extrabold tracking-[0.06em] text-paper-dim [writing-mode:vertical-rl] rotate-180">
                {more.count} more {more.count === 1 ? "volume" : "volumes"}
              </span>
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

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
      className="flex min-w-0 flex-col rounded-md bg-ink-2 px-4.5 pt-4 pb-3.5"
    >
      <div className="flex items-center gap-3 border-b-2 border-paper pb-2.5">
        <MemberAvatar userId={contributor.user_id} name={name} className="size-11" fallbackClassName="text-base" />
        <div className="min-w-0">
          <h3 className="font-headline truncate text-[1.6rem] leading-[0.9]">{name}</h3>
          <small className="font-label mt-1 block text-[0.76rem] tracking-[0.08em] text-paper-mute">
            {contributor.game_count} {contributor.game_count === 1 ? "game" : "games"} ·{" "}
            {contributor.entry_count} {contributor.entry_count === 1 ? "entry" : "entries"}
          </small>
        </div>
      </div>
      {games === null ? (
        <p className="py-4 text-sm text-paper-mute">Their chapters couldn&apos;t be loaded right now.</p>
      ) : (
        <ul className="mt-1">
          {rows.map((row) => (
            <li key={row.game!.game_id} className="border-b border-rule">
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
                <span className="text-[0.82rem] text-paper-mute">{journalDate(row.last_entry_at)}</span>
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
          <span className="font-label text-[0.76rem] tracking-[0.08em] text-paper-mute">
            +{rest} more {rest === 1 ? "game" : "games"}
          </span>
        )}
        <Link
          href={`/members/${contributor.user_id}/journal`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "ml-auto")}
        >
          Open {name}&apos;s journal
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
