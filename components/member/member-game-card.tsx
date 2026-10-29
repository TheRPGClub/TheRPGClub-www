import Link from "next/link";
import type { Game, Platform } from "@/lib/api/types";
import { MemberCover } from "@/components/issue/member-cover";
import { cn } from "@/lib/utils";

export interface MemberGameCardProps {
  game: Game | null | undefined;
  platform?: Platform | null;
  note?: string | null;
  // Renders alongside the title; e.g. a status menu or a star rating.
  trailing?: React.ReactNode;
  // Renders as the meta line under the title.
  meta?: React.ReactNode;
  // A big numeral standing over the cover's top-left corner (a rank).
  numeral?: React.ReactNode;
  className?: string;
}

// One game on a list page: the cover with its platform tab, the title in the
// label voice, a meta line and the member's note.
export function MemberGameCard({
  game,
  platform,
  note,
  trailing,
  meta,
  numeral,
  className,
}: MemberGameCardProps) {
  const title = game?.title ?? "Unknown game";
  const href = game ? `/games/${game.game_id}` : null;

  const cover = (
    <span className="relative block">
      {numeral != null && (
        <span className="font-headline absolute -top-3.5 left-1 z-10 text-[3.25rem] leading-none text-paper [-webkit-text-stroke:6px_var(--color-ink)] [paint-order:stroke_fill]">
          {numeral}
        </span>
      )}
      <MemberCover game={game} platform={platform} />
    </span>
  );

  return (
    <div className={cn("group/cover flex flex-col", className)}>
      {href ? (
        <Link href={href} className="block" tabIndex={-1} aria-hidden>
          {cover}
        </Link>
      ) : (
        cover
      )}
      <div className="mt-2.5 flex items-start gap-1.5">
        <div className="min-w-0 flex-1">
          {href ? (
            <Link
              href={href}
              className="font-label line-clamp-2 text-[0.97rem] leading-tight font-bold tracking-[0.02em] transition-colors hover:text-highlight"
            >
              {title}
            </Link>
          ) : (
            <p className="font-label line-clamp-2 text-[0.97rem] leading-tight font-bold tracking-[0.02em]">
              {title}
            </p>
          )}
          {meta && (
            <div className="font-label mt-1 flex items-center gap-1.5 text-[0.8rem] font-bold tracking-[0.06em] text-paper-mute [&_svg]:size-3.5">
              {meta}
            </div>
          )}
          {note && (
            <p className="mt-1.5 line-clamp-3 text-[0.82rem] leading-snug text-paper-dim italic">
              &ldquo;{note}&rdquo;
            </p>
          )}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
    </div>
  );
}

// The list pages' cover grid.
export const memberGridClass =
  "grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function MemberListEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-sm border border-dashed border-rule-strong px-4 py-10 text-center text-sm text-paper-mute">
      {children}
    </p>
  );
}
