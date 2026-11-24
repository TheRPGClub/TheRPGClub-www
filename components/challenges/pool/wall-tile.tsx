import Link from "next/link";
import { isPlayed, type WallTile } from "@/lib/challenges/pool-wall";
import { initials } from "@/lib/challenges/runs";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";
import { MemberMark } from "@/components/challenges/host-badge";

// One cover on the Pool view's wall, linking to the game, with the marks of
// the members who Cleared it (solid) or have it In Progress (a paper ring).
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
        {tile.cleared.map((name) => (
          <span
            key={`c-${name}`}
            title={`${name} Cleared it`}
            className="rounded-full shadow-[0_0_0_2px_var(--color-background)]"
          >
            <MemberMark name={name} size={20} />
          </span>
        ))}
        {tile.inProgress.map((name) => (
          <span
            key={`p-${name}`}
            title={`${name} has it In Progress`}
            className="font-label grid size-5 place-items-center rounded-full text-[0.55rem] leading-none font-extrabold text-foreground shadow-[inset_0_0_0_1.5px_var(--color-foreground)]"
          >
            {initials(name)}
          </span>
        ))}
      </div>
    </li>
  );
}
