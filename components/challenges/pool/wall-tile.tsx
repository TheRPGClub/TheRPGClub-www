import Link from "next/link";
import { isPlayed, type WallTile } from "@/lib/challenges/pool-wall";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";
import { MemberMark } from "@/components/challenges/host-badge";
import { MemberLink } from "@/components/member/member-link";

// One cover on the Pool view's wall, linking to the game, with the marks of
// the members who Cleared it (solid) or have it In Progress (faded, in a
// paper ring), each opening the member's profile.
// An Optional Game's tag says it is new or was added by hand, and its title
// says where it comes from.
const FROM = { hand: "added by hand", list: "from the Game List", franchise: "from a Franchise", series: "from a Series" };
export function WallTileCover({ tile }: { tile: WallTile }) {
  const played = isPlayed(tile);
  return (
    <li className="flex flex-col gap-1.5">
      <Link
        href={`/games/${tile.game.game_id}`}
        title={tile.source ? `${tile.game.title} (${FROM[tile.source]})` : tile.game.title}
        className={cn(
          "relative rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-highlight",
          tile.yours && "outline-2 outline-offset-3 outline-highlight",
        )}
      >
        <GameCover
          title={tile.game.title}
          coverUrl={tile.game.cover_url}
          alt={tile.game.title}
          className={cn("w-full", !played && "opacity-50")}
          fallbackClassName="text-[0.85rem] p-1.5"
        />
        {tile.tag && (
          <span className="font-label absolute bottom-[5px] left-[5px] rounded-xs bg-foreground px-1 pt-[3px] pb-0.5 text-[0.66rem] leading-none font-extrabold tracking-[0.06em] text-background">
            {tile.tag === "new" ? "New" : "Added"}
          </span>
        )}
      </Link>
      <div className="flex min-h-5 flex-wrap gap-0.5">
        {tile.cleared.map((m) => (
          <MemberLink key={`c-${m.userId}`} userId={m.userId} className="block">
            <span
              title={`${m.name} Cleared it`}
              className="block rounded-full shadow-[0_0_0_2px_var(--color-background)]"
            >
              <MemberMark name={m.name} src={m.avatarUrl} size={20} />
            </span>
          </MemberLink>
        ))}
        {tile.inProgress.map((m) => (
          <MemberLink key={`p-${m.userId}`} userId={m.userId} className="block">
            <span
              title={`${m.name} has it In Progress`}
              className="relative grid size-5 place-items-center rounded-full opacity-60 shadow-[0_0_0_1.5px_var(--color-foreground)]"
            >
              <MemberMark name={m.name} src={m.avatarUrl} size={20} />
            </span>
          </MemberLink>
        ))}
      </div>
    </li>
  );
}
