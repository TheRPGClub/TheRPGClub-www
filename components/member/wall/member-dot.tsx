import Link from "next/link";
import type { WallMember } from "@/lib/members/member-tiers";
import { memberPictureSrc } from "@/lib/members/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// One member on the page: their avatar, linking to their profile, with their
// name, username and roles in a tooltip on hover or focus.

export function MemberDot({ member }: { member: WallMember }) {
  const roles = member.roles.join(" · ");

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={`/members/${member.userId}`}
            aria-label={`${member.name}, ${roles}`}
            className="block rounded-full ring-offset-2 ring-offset-background hover:ring-2 hover:ring-highlight motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
          />
        }
      >
        <Avatar variant="byline" className="size-12 text-lg after:hidden sm:size-14 sm:text-xl">
          <AvatarImage src={memberPictureSrc({ user_id: member.userId, discord_avatar: member.discordAvatar })} alt="" />
          <AvatarFallback className="font-label font-extrabold text-[length:inherit]">
            {member.name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        <span className="flex flex-col gap-0.5 py-0.5">
          <span className="font-semibold">{member.name}</span>
          <span>
            {member.username ? `@${member.username} · ` : ""}
            {roles}
          </span>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
