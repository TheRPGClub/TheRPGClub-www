import { Plus } from "lucide-react";
import type { GameList } from "@/lib/game-lists/types";
import { privateNote } from "@/lib/game-lists/text";
import { ButtonLink } from "@/components/ui/button";
import { MemberShelf } from "@/components/issue/member-shelf";
import { SpineLiftRow } from "@/components/member/profile/spine-lift-row";
import { ListSpine } from "@/components/game-lists/profile/list-spine";

// A member's Game Lists on their profile (pick D, 2026-11-26): a shelf like
// the bookcase's below it, the count and "Game Lists" on the left and one
// box-set spine per list on the right. A spine lifts on hover or focus and
// hangs a paper tag with its size, name and last change; a click opens the
// list. Your own profile adds your Private lists and a dashed New list slot.
export function ProfileLists({ lists, own, now }: { lists: GameList[]; own: boolean; now: string }) {
  const today = new Date(now);
  return (
    <MemberShelf
      label="Game Lists"
      count={lists.length}
      blurb={privateNote(lists, own)}
      Row={SpineLiftRow}
      links={
        own
          ? [{ href: "/lists/new", label: "New list", icon: <Plus aria-hidden /> }]
          : [{ href: "/lists", label: "All Game Lists" }]
      }
      empty="No Game Lists yet. A list can be ranked, A to Z or by date added, and Members-visible or Private."
    >
      {lists.map((list, i) => (
        <ListSpine key={list.id} list={list} index={i} now={today} />
      ))}
      {own && (
        <ButtonLink
          href="/lists/new"
          variant="add"
          size="bare"
          className="h-[11.5rem] w-[4.4rem] shrink-0 flex-col items-center justify-center gap-2 self-end max-sm:hidden"
        >
          <span className="font-headline rotate-180 text-[1.05rem] leading-none [writing-mode:vertical-rl]">
            New list
          </span>
          <Plus aria-hidden />
        </ButtonLink>
      )}
    </MemberShelf>
  );
}
