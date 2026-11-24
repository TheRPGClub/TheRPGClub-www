"use client";

import type { GameCollection } from "@/lib/api/types";
import {
  MemberGameCard,
  MemberListEmpty,
  memberGridClass,
} from "@/components/member/member-game-card";
import { ManagedShelf } from "./managed-shelf";

// The Collection page's body for its owner (spec api#451, pick 3A): the
// same cards everyone sees, edited and removed in place. It has no order.
export function OwnedCollection({
  entries,
  filtered,
}: {
  entries: GameCollection[];
  filtered: boolean;
}) {
  if (entries.length === 0) {
    return (
      <MemberListEmpty>
        {filtered
          ? "No owned games on this platform."
          : "No owned games tracked yet. Add one you own."}
      </MemberListEmpty>
    );
  }
  return (
    <ManagedShelf
      kind="collection"
      entries={entries}
      gridClass={memberGridClass}
      renderCard={(entry) => (
        <MemberGameCard
          game={entry.game}
          platform={entry.platform}
          note={entry.note}
          meta={entry.ownership_type || "Owned"}
        />
      )}
    />
  );
}
