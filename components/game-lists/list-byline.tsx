import { Lock, Users } from "lucide-react";
import type { GameList } from "@/lib/game-lists/types";
import { SORT_LABEL, memberName } from "@/lib/game-lists/types";
import { memberAvatar } from "@/lib/challenges/runs";
import { cn } from "@/lib/utils";
import { MemberMark } from "@/components/challenges/host-badge";

// Who keeps a list: the owner's mark and name, or the club's logo and "The
// club". Label caps in the faint ink, as on every card's meta line.
export function ListOwner({ list, size = 20, className }: { list: GameList; size?: number; className?: string }) {
  const name = memberName(list.owner);
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <MemberMark
        name={name}
        club={list.club}
        src={list.owner ? memberAvatar(list.owner) : null}
        size={size}
      />
      <span className="truncate">{name}</span>
    </span>
  );
}

// A card's meta line: owner, then the order ("Mara · Ranked").
export function ListMeta({ list, extra, className }: { list: GameList; extra?: string; className?: string }) {
  return (
    <p
      className={cn(
        "font-label flex min-w-0 items-center gap-2 text-[0.78rem] font-bold tracking-[0.07em] text-faint-foreground",
        className,
      )}
    >
      <ListOwner list={list} />
      <span aria-hidden>·</span>
      <span className="shrink-0 text-dim-foreground">{SORT_LABEL[list.sort]}</span>
      {extra && (
        <>
          <span aria-hidden>·</span>
          <span className="shrink-0">{extra}</span>
        </>
      )}
    </p>
  );
}

// Members or Private, as an outlined mark.
export function VisibilityMark({ list }: { list: Pick<GameList, "visibility"> }) {
  const priv = list.visibility === "private";
  const Icon = priv ? Lock : Users;
  return (
    <span className="font-label inline-flex h-6 items-center gap-1.5 rounded-xs px-2 text-[0.78rem] font-bold tracking-[0.06em] text-foreground shadow-[inset_0_0_0_1.5px_var(--color-dim-foreground)]">
      <Icon aria-hidden className="size-3.5" />
      {priv ? "Private" : "Members"}
    </span>
  );
}
