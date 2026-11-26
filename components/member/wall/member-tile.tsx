import Link from "next/link";
import { ROLE_BAND, memberDisplayName, type WallMember } from "@/lib/members/members-wall";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memberPictureSrc } from "@/lib/members/avatar";
import { cn } from "@/lib/utils";

// One member on the wall: a square portrait (or their initial), a staff
// member's role banded across its foot, then the name and handle.

export function MemberTile({ member }: { member: WallMember }) {
  const { user, role } = member;
  const name = memberDisplayName(user);
  const band = ROLE_BAND[role];

  return (
    <Link
      href={`/members/${user.user_id}`}
      className="group/tile flex flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-faint-foreground"
    >
      <span className="relative block aspect-square overflow-hidden">
        <Avatar variant="tile" className="size-full after:hidden">
          <AvatarImage
            src={memberPictureSrc(user)}
            alt=""
            className="motion-safe:transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:group-hover/tile:scale-[1.04]"
          />
          {/* No avatar on file: the member's initial, set like a cover
              line on an ink block. */}
          <AvatarFallback className="font-headline text-[4.5rem] sm:text-[6rem]">
            {name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {band && (
          <span
            className={cn(
              "font-label absolute inset-x-0 bottom-0 py-1.25 text-center text-[0.78rem] font-extrabold tracking-[0.12em] text-foreground",
              role === "admin" ? "bg-background" : "bg-background/75",
            )}
          >
            {band}
          </span>
        )}
      </span>
      <span className="block min-w-0 px-3 pt-2.5 pb-3">
        <span className="font-headline block truncate text-[1.35rem] leading-none sm:text-2xl">
          {name}
        </span>
        {user.username && (
          <span className="mt-1 block truncate text-[0.8rem] text-faint-foreground">
            @{user.username}
          </span>
        )}
      </span>
    </Link>
  );
}
