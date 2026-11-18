"use client";

import type { MentionPicker } from "@/hooks/use-mention-picker";
import { memberName } from "@/lib/achievements";
import { discordAvatarUrl } from "@/lib/auth-types";
import { cn } from "@/lib/utils";

// The @ mention picker's list under the Fun Fact field (5D): "Mention a
// member", the matching members with the lit one ringed in yellow, and the
// keys. The field keeps focus; it points at the lit option.
export function MentionList({ picker, id }: { picker: MentionPicker; id: string }) {
  if (!picker.open) return null;
  const { results, lit, settled, error } = picker;
  return (
    <div className="absolute top-full left-0 z-20 mt-1.5 w-full max-w-[19.5rem] rounded-md border border-border-strong bg-muted p-1.5 shadow-[0_14px_34px_rgb(0_0_0/0.6)]">
      <p className="font-label px-1.5 pt-1 pb-1.5 text-[0.75rem] font-extrabold tracking-[0.08em] text-faint-foreground">
        Mention a member
      </p>
      {error && <p className="px-1.5 py-2 text-sm text-faint-foreground">The member search isn&apos;t answering.</p>}
      {!error && !settled && <p className="px-1.5 py-2 text-sm text-faint-foreground">Searching…</p>}
      {!error && settled && results.length === 0 && (
        <p className="px-1.5 py-2 text-sm text-faint-foreground">No member matches.</p>
      )}
      <div role="listbox" id={id} aria-label="Matching members">
        {results.map((user, i) => (
          <div
            key={user.user_id}
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === lit}
            tabIndex={-1}
            onMouseDown={(event) => {
              event.preventDefault();
              picker.pick(user);
            }}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 hover:bg-card",
              i === lit && "bg-card shadow-[inset_0_0_0_1.5px_var(--color-highlight)]",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a small Discord avatar, already sized by Discord's CDN */}
            <img src={discordAvatarUrl(user.user_id, user.discord_avatar, 64)} alt="" className="size-6.5 rounded-full bg-card" />
            <span className="min-w-0 flex-1 truncate">{memberName(user)}</span>
            {user.username && <span className="truncate text-xs text-faint-foreground">@{user.username}</span>}
          </div>
        ))}
      </div>
      <p className="border-t border-border px-1.5 pt-1.5 text-[0.8rem] text-faint-foreground">
        Enter to mention · nobody is pinged
      </p>
    </div>
  );
}
