import type { NominatedGame } from "@/lib/goty/awards";
import { memberName } from "@/lib/goty/awards";
import { memberPictureSrc } from "@/lib/members/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AwardCover } from "./award-cover";

// Every Game of the Year nomination so far, each game once: its cover
// (the viewer's own pick marked), its title, and the stacked avatars of
// the members who nominated it. No reasons.
export function NominationsWall({ games }: { games: NominatedGame[] }) {
  if (!games.length) {
    return (
      <p data-slot="issue-note" className="rounded-md border border-dashed border-border-strong px-4 py-10 text-center text-dim-foreground">
        No nominations yet. Be the first!
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-5.5 sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))]">
      {games.map(({ game, by, mine }) => (
        <li key={game.game_id} className="relative flex flex-col gap-1.5">
          <AwardCover award="game_of_the_year" game={game} fallbackClassName="text-base" />
          {mine && (
            <Badge tone="highlight" className="absolute top-2 left-2">
              Your pick
            </Badge>
          )}
          <h3 className="font-headline mt-0.5 text-[1.15rem] leading-[0.95] break-words">{game.title}</h3>
          <p className="flex items-center gap-2">
            <span className="flex">
              {by.slice(0, 5).map((user, i) => (
                <Avatar key={user.user_id} variant="credit" className={i ? "-ml-1.75 size-5" : "size-5"}>
                  <AvatarImage src={memberPictureSrc(user)} alt={memberName(user)} />
                  <AvatarFallback className="font-label text-[0.6rem]">{memberName(user)[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
            </span>
            <span className="font-label text-[0.72rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">
              {by.length} {by.length === 1 ? "nomination" : "nominations"}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
