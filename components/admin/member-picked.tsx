import { X } from "lucide-react";
import type { User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { discordAvatarUrl } from "@/lib/auth-types";
import { Button } from "@/components/ui/button";

// The picked member set big on the desk's yellow underline, with "Change"
// to clear the pick and search again.
export function MemberPicked({ member, disabled, onChange }: { member: User; disabled?: boolean; onChange: () => void }) {
  return (
    <div className="flex items-end gap-3 border-b-2 border-highlight pt-1.5 pb-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={discordAvatarUrl(member.user_id, member.discord_avatar, 64)}
        alt=""
        className="mb-1 size-9 shrink-0 rounded-full bg-muted"
      />
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
