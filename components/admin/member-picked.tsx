import { X } from "lucide-react";
import type { User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/issue/member-cover";

// The picked member set big on the desk's yellow underline, with "Change"
// to clear the pick and search again.
export function MemberPicked({ member, disabled, onChange }: { member: User; disabled?: boolean; onChange: () => void }) {
  return (
    <div className="flex items-end gap-3 border-b-2 border-highlight pt-1.5 pb-2.5">
      <MemberAvatar userId={member.user_id} discordAvatar={member.discord_avatar} name={memberName(member)} className="mb-1 size-9 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-headline truncate text-[1.8rem] leading-none md:text-[2.4rem]">{memberName(member)}</p>
        <p className="mt-1 truncate text-[0.85rem] text-faint-foreground">
          {member.username ? `@${member.username}` : member.user_id}
          {member.server_left_at ? " · left the server" : ""}
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onChange}>
        <X aria-hidden />
        Change
      </Button>
    </div>
  );
}
