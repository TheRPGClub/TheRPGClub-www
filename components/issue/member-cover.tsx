import type { Game, Platform } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// The member department's shared pieces: a 3:4 cover with its title fallback
// and platform tab, and the member's avatar disc.

const API_BASE = process.env.API_URL ?? "http://localhost:3000";

export function platformShort(platform: Platform | null | undefined): string | null {
  if (!platform) return null;
  return (
    platform.platform_abbreviation ??
    platform.platform_code ??
    platform.platform_name
  );
}

// A game's cover. Games without one (the dev data has none) get an ink-3
// block with the title set in the headline voice, never a broken image.
export function MemberCover({
  game,
  title,
  platform,
  className,
  imgClassName,
  fallbackClassName,
}: {
  game: Game | null | undefined;
  // Overrides the game's title for the fallback (e.g. "Unknown game").
  title?: string;
  platform?: Platform | null;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}) {
  const name = title ?? game?.title ?? "Unknown game";
  const src = game?.cover_url ?? game?.art_url ?? null;
  const tab = platformShort(platform);
  return (
    <div
      className={cn(
        "relative aspect-3/4 overflow-hidden rounded-[3px] bg-ink-3",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className={cn(
            "size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/cover:scale-[1.04]",
            imgClassName,
          )}
        />
      ) : (
        <span
          className={cn(
            "font-headline grid size-full place-items-center p-3 text-center text-xl leading-[0.95] text-balance text-paper-mute",
            fallbackClassName,
          )}
        >
          {name}
        </span>
      )}
      {tab && (
        <span className="font-label absolute bottom-1.5 left-1.5 rounded-[2px] bg-ink/85 px-1.5 py-px text-[0.72rem] font-extrabold tracking-[0.06em] text-paper">
          {tab}
        </span>
      )}
    </div>
  );
}

export function MemberAvatar({
  userId,
  name,
  className,
  fallbackClassName,
}: {
  userId: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={cn("size-10 after:hidden", className)}>
      <AvatarImage src={`${API_BASE}/api/v1/users/${userId}/avatar`} alt="" />
      <AvatarFallback
        className={cn(
          "font-headline bg-paper text-ink",
          fallbackClassName,
        )}
      >
        {name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
