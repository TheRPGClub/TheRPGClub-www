import Link from "next/link";
import type { Game, Platform } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export interface MemberGameCardProps {
  game: Game | null | undefined;
  platform?: Platform | null;
  note?: string | null;
  // Renders alongside the title; e.g. a status menu or a star rating.
  trailing?: React.ReactNode;
  // Renders as the second meta row under the platform.
  meta?: React.ReactNode;
  className?: string;
}

export function MemberGameCard({
  game,
  platform,
  note,
  trailing,
  meta,
  className,
}: MemberGameCardProps) {
  const title = game?.title ?? "Unknown game";
  const imageUrl = game?.cover_url ?? game?.art_url ?? null;
  const platformLabel = platform?.platform_name ?? null;
  const href = game ? `/games/${game.game_id}` : null;

  const cover = (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border bg-muted">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-2">
          <span className="text-center text-xs text-muted-foreground line-clamp-4">
            {title}
          </span>
        </div>
      )}
      {platformLabel && (
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground/80 ring-1 ring-inset ring-border backdrop-blur-sm">
          {platformLabel}
        </span>
      )}
    </div>
  );

  return (
    <div className={cn("group flex flex-col gap-2", className)}>
      {href ? (
        <Link href={href} className="block">
          {cover}
        </Link>
      ) : (
        cover
      )}
      <div className="flex items-start gap-1.5">
        <div className="min-w-0 flex-1">
          {href ? (
            <Link
              href={href}
              className="block text-sm font-medium leading-tight line-clamp-2 hover:underline"
            >
              {title}
            </Link>
          ) : (
            <p className="text-sm font-medium leading-tight line-clamp-2">
              {title}
            </p>
          )}
          {meta && (
            <div className="mt-0.5 text-xs text-muted-foreground">{meta}</div>
          )}
          {note && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 italic">
              {note}
            </p>
          )}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
    </div>
  );
}
