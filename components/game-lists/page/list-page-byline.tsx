import type { GameList } from "@/lib/game-lists/types";
import { memberName } from "@/lib/game-lists/types";
import { updatedText } from "@/lib/game-lists/text";
import { ListOwner, VisibilityMark } from "@/components/game-lists/list-byline";

// Under a list's name: who keeps it (linked to their profile), who sees it,
// when it last changed and, for a list the club took over, who it came
// from; then its description.
export function ListPageByline({ list, now }: { list: GameList; now: Date }) {
  return (
    <div data-slot="list-page-byline" className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.95rem] text-dim-foreground">
        <ListOwner list={list} size={22} className="font-semibold text-foreground" />
        <Dot />
        <VisibilityMark list={list} />
        <Dot />
        <span>Updated {updatedText(list.updated_at, now)}</span>
        {list.taken_over_from && (
          <>
            <Dot />
            <span>from {memberName(list.taken_over_from)}</span>
          </>
        )}
      </div>
      {list.description && <p className="max-w-[65ch] text-dim-foreground">{list.description}</p>}
    </div>
  );
}

function Dot() {
  return <span aria-hidden className="size-[3px] rounded-full bg-faint-foreground" />;
}
