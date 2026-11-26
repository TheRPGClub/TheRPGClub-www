import type { Game, Platform } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memberPictureSrc } from "@/lib/members/avatar";
import { cn } from "@/lib/utils";

// The member department's shared pieces: a 3:4 cover with its title fallback
// and platform tab, and the member's avatar disc.

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
        "relative aspect-3/4 overflow-hidden rounded-[3px] bg-muted",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          src={src}
          alt=""
          className={cn(
            "size-full object-cover motion-safe:transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:group-hover/cover:scale-[1.04]",
            imgClassName,
          )}
        />
      ) : (
        <span
          className={cn(
            "font-headline grid size-full place-items-center p-3 text-center text-xl leading-[0.95] text-balance text-faint-foreground",
            fallbackClassName,
          )}
        >
          {name}
        </span>
      )}
      {tab && (
        <span className="font-label absolute bottom-1.5 left-1.5 rounded-[2px] bg-background/85 px-1.5 py-px text-[0.72rem] font-extrabold tracking-[0.06em] text-foreground">
          {tab}
        </span>
      )}
    </div>
  );
}

export function MemberAvatar({
  userId,
  discordAvatar = null,
  name,
  className,
  fallbackClassName,
}: {
  userId: string;
  // Their Discord avatar hash, when the payload carries it (memberPictureSrc).
  discordAvatar?: string | null;
  name: string;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar variant="inverse" className={cn("size-10 after:hidden", className)}>
      <AvatarImage src={memberPictureSrc({ user_id: userId, discord_avatar: discordAvatar })} alt="" />
      <AvatarFallback
        className={cn(
          "font-headline",
          fallbackClassName,
        )}
      >
        {name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
