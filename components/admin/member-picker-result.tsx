import type { User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { discordAvatarUrl } from "@/lib/auth-types";
import { ComboboxItem } from "@/components/ui/combobox";

// One member in the member picker's list: avatar, name, handle (and "left
// the server"), and a Pick tag that fills yellow while the row is lit.
export function MemberPickerResult({ user }: { user: User }) {
  return (
    <ComboboxItem
      value={user}
      variant="result"
      className="group/result grid grid-cols-[2rem_minmax(0,1fr)_auto] gap-3 px-2.5 py-2 text-left"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a small Discord avatar, already sized by Discord's CDN */}
      <img src={discordAvatarUrl(user.user_id, user.discord_avatar, 64)} alt="" className="size-8 rounded-full bg-card" />
      <span className="min-w-0">
        <span className="block truncate font-semibold">{memberName(user)}</span>
        <span className="block truncate text-xs text-faint-foreground">
          {user.username ? `@${user.username}` : user.user_id}
          {user.server_left_at ? " · left the server" : ""}
        </span>
      </span>
      <span className="font-label rounded-xs border border-border-strong px-2 py-0.5 text-[0.75rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors group-data-highlighted/result:border-highlight group-data-highlighted/result:bg-highlight group-data-highlighted/result:text-highlight-foreground">
        Pick
      </span>
    </ComboboxItem>
  );
}
