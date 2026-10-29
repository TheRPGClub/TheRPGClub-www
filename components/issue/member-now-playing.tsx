import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import type { UserNowPlaying } from "@/lib/api/types";
import { resolveEntryId } from "@/lib/api/game-list-entry";
import { shortDate } from "@/components/member/member-lists";
import { cn } from "@/lib/utils";

// Now Playing as open books: each game face-on in its wide key art, the
// member's note under the title. The rest of a profile is closed spines on
// the shelf; these are the ones on the desk.

export function NowPlayingBooks({
  entries,
  showSince = false,
  className,
}: {
  entries: UserNowPlaying[];
  // The list page has room for when each was picked up.
  showSince?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {entries.map((entry, i) => (
        <li key={resolveEntryId("now_playing", entry) ?? i}>
          <OpenBook entry={entry} showSince={showSince} />
        </li>
      ))}
    </ul>
  );
}

function OpenBook({
  entry,
  showSince,
}: {
  entry: UserNowPlaying;
  showSince: boolean;
}) {
  const game = entry.game;
  const title = game?.title ?? "Unknown game";
  const art = game?.art_url ?? game?.cover_url ?? null;
  const platform = entry.platform?.platform_name ?? null;
  const since = showSince ? shortDate(entry.added_at) : null;
  const body = (
    <>
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[60%_30%] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/book:scale-[1.04]"
        />
      )}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          art
            ? "bg-[linear-gradient(0deg,rgb(11_11_13/0.95)_0%,rgb(11_11_13/0.6)_45%,rgb(11_11_13/0.05)_100%)]"
            : "bg-ink-3",
        )}
      />
      <span className="mt-auto block p-4">
        <span className="font-headline block text-[1.75rem] leading-[0.95] text-balance">
          {title}
        </span>
        {(platform || since) && (
          <span className="font-label mt-1.5 flex items-center gap-1.5 text-[0.8rem] font-bold tracking-[0.06em] text-paper-dim">
            <Gamepad2 aria-hidden className="size-3.5" />
            {[platform, since && `since ${since}`].filter(Boolean).join(" · ")}
          </span>
        )}
        {entry.note && (
          <span className="mt-1.5 line-clamp-2 block text-[0.82rem] leading-snug text-paper-dim italic">
            &ldquo;{entry.note}&rdquo;
          </span>
        )}
      </span>
    </>
  );
  const cls =
    "group/book relative isolate flex aspect-video overflow-hidden rounded-sm bg-black";
  return game ? (
    <Link href={`/games/${game.game_id}`} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
