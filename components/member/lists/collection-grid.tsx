import type { GameCollection } from "@/lib/api/types";
import {
  MemberGameCard,
  MemberListEmpty,
  memberGridClass,
} from "@/components/member/member-game-card";

// The owned games, each with how it's owned.
export function CollectionGrid({
  entries,
  filtered,
}: {
  entries: GameCollection[];
  // True when the list is narrowed to one platform.
  filtered: boolean;
}) {
  if (entries.length === 0) {
    return (
      <MemberListEmpty>
        {filtered ? "No owned games on this platform." : "No owned games tracked yet."}
      </MemberListEmpty>
    );
  }
  return (
    <ul className={memberGridClass}>
      {entries.map((entry, i) => (
        <li key={entry.entry_id ?? entry.collection_id ?? i}>
          <MemberGameCard
            game={entry.game}
            platform={entry.platform}
            note={entry.note}
            meta={entry.ownership_type || "Owned"}
          />
        </li>
      ))}
    </ul>
  );
}
