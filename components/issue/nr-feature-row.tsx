import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GotmRoundGame } from "@/lib/api/types";
import { gotmCardProps } from "@/components/gotm-card";
import { UNKNOWN_GAME_TITLE } from "@/components/issue/nr-feature-copy";
import { cn } from "@/lib/utils";

// One winner in the NR-GOTM ranked list: a cover, the title with its letter
// and facts, and an arrow when it links to the game.
export function NrFeatureRow({
  entry,
  i,
  count,
}: {
  entry: GotmRoundGame;
  // The winner's place in the list (A, B, C).
  i: number;
  // How many winners the list has (two get the bigger rows).
  count: number;
}) {
  const game = gotmCardProps(entry.game ?? null, UNKNOWN_GAME_TITLE);
  const cover = game.coverUrl ?? game.artUrl;
  const href = entry.gamedb_game_id
    ? `/games/${entry.gamedb_game_id}`
    : null;
  const body = (
    <>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xs bg-muted after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-nr",
          count === 2 ? "h-22 w-16.5" : "h-[4.3rem] w-13",
        )}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img src={cover} alt="" className="size-full object-cover" />
        )}
      </div>
      <div className="min-w-0">
        <h3
          className={cn(
            "font-headline truncate",
            count === 2 ? "text-[2rem]" : "text-[1.7rem]",
          )}
        >
          {game.title}
        </h3>
        <p className="font-label mt-1 truncate text-[0.78rem] text-faint-foreground">
          <span className="font-headline mr-1.5 text-[0.95rem] text-nr-soft">
            {"ABC"[i]}
          </span>
          {[game.year, ...(game.platforms ?? []).slice(0, 3).map((p) => p.platform_abbreviation ?? p.platform_name)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {href && (
        <ArrowRight
          aria-hidden
          className="size-4 text-faint-foreground transition-colors group-hover/row:text-nr-soft"
        />
      )}
    </>
  );
  const rowClass =
    "group/row grid h-full grid-cols-[auto_1fr_auto] items-center gap-3.5 px-4 py-2";
  return (
    <li className="flex-1 border-t border-border">
      {href ? (
        <Link
          href={href}
          className={cn(rowClass, "transition-colors hover:bg-muted")}
        >
          {body}
        </Link>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}
