import type { Nomination } from "@/lib/api/types";
import { memberAvatarSrc } from "@/lib/members/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Who nominated the game: their avatar and name ("You" for the viewer).
export function NominationCredit({
  nominator,
  isOwn,
}: {
  nominator: Nomination["user"];
  isOwn: boolean;
}) {
  const name = nominator?.global_name ?? nominator?.username ?? "Unknown member";
  return (
    <p className="font-label flex min-w-0 items-center gap-1.75 text-[0.82rem] font-bold tracking-[0.06em] text-faint-foreground">
      <Avatar variant="credit" className="size-5 after:hidden">
        <AvatarImage
          src={nominator ? memberAvatarSrc(nominator.user_id) : undefined}
          alt=""
        />
        <AvatarFallback className="font-label text-[0.65rem]">
          {name[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">
        <span className="sr-only">Nominated by </span>
        {isOwn ? "You" : name}
      </span>
    </p>
  );
}
