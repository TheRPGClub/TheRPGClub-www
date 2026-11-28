import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Gamepad2 } from "lucide-react";
import type { UserNowPlaying } from "@/lib/api/types";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import { shortDate } from "@/lib/members/member-lists";
import { cn } from "@/lib/utils";

// Now Playing as open books: each game face-on in its wide key art, the
// member's note under the title. The rest of a profile is closed spines on
// the shelf; these are the ones on the desk.

export function NowPlayingBooks<E extends UserNowPlaying>({
  entries,
  showSince = false,
  corner,
  className,
}: {
  entries: E[];
  // The list page has room for when each was picked up.
  showSince?: boolean;
  // Something pinned to each book's top-right corner (the profile's hours).
  corner?: (entry: E) => ReactNode;
  className?: string;
}) {
  return (
    <ul data-slot="now-playing" className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {entries.map((entry, i) => (
        <li key={resolveEntryId("now_playing", entry) ?? i}>
          <OpenBook entry={entry} showSince={showSince} corner={corner?.(entry)} />
        </li>
      ))}
    </ul>
  );
}

export function OpenBook({
  entry,
  showSince,
  corner,
}: {
  entry: UserNowPlaying;
  showSince: boolean;
  corner?: ReactNode;
}) {
  const game = entry.game;
  const title = game?.title ?? "Unknown game";
  const art = game?.art_url ?? game?.cover_url ?? null;
  const platform = entry.platform?.platform_name ?? null;
  const since = showSince ? shortDate(entry.added_at) : null;
  // The box art, for a Theme that shows the book as its cover (unused, and
  // never fetched, under Monthly Issue).
  const cover = game?.cover_url ? ({ "--book-cover": `url(${JSON.stringify(game.cover_url)})` } as CSSProperties) : undefined;
  const body = (
    <>
      {art && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          src={art}
          alt=""
          data-slot="open-book-art"
          className="absolute inset-0 -z-20 size-full object-cover object-[60%_30%] motion-safe:transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:group-hover/book:scale-[1.04]"
        />
      )}
      <span
        aria-hidden
        data-slot="open-book-scrim"
        className={cn(
          "absolute inset-0 -z-10",
          art
            ? "bg-[linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_95%,transparent)_0%,color-mix(in_oklab,var(--color-background)_60%,transparent)_45%,color-mix(in_oklab,var(--color-background)_5%,transparent)_100%)]"
            : "bg-muted",
        )}
      />
      {corner}
      <span data-slot="open-book-text" className="mt-auto block p-4">
        <span data-slot="open-book-title" className="font-headline block text-[1.75rem] leading-[0.95] text-balance">
          {title}
        </span>
        {(platform || since) && (
          <span className="font-label mt-1.5 flex items-center gap-1.5 text-[0.8rem] font-bold tracking-[0.06em] text-dim-foreground">
            <Gamepad2 aria-hidden className="size-3.5" />
            {[platform, since && `since ${since}`].filter(Boolean).join(" · ")}
          </span>
        )}
        {entry.note && (
          <span className="mt-1.5 line-clamp-2 block text-[0.82rem] leading-snug text-dim-foreground italic">
            &ldquo;{entry.note}&rdquo;
          </span>
        )}
      </span>
    </>
  );
  const cls =
    "group/book relative isolate flex aspect-video overflow-hidden rounded-sm bg-black";
  return game ? (
    <Link href={`/games/${game.game_id}`} data-slot="open-book" style={cover} className={cls}>
      {body}
    </Link>
  ) : (
    <div data-slot="open-book" style={cover} className={cls}>{body}</div>
  );
}
