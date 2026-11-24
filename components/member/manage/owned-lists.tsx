"use client";

import type {
  UserBacklog,
  UserFavorite,
  UserNowPlaying,
} from "@/lib/api/types";
import { shortDate } from "@/lib/members/member-lists";
import { OpenBook } from "@/components/issue/member-now-playing";
import {
  MemberGameCard,
  MemberListEmpty,
  memberGridClass,
} from "@/components/member/member-game-card";
import { ManagedShelf } from "./managed-shelf";

// Each list page's body for its owner (spec api#451, pick 3A): the same
// cards everyone sees, managed in place. Places run across pages.

export function OwnedNowPlaying({
  entries,
  offset,
}: {
  entries: UserNowPlaying[];
  offset: number;
}) {
  if (entries.length === 0)
    return (
      <MemberListEmpty>
        Nothing in progress. Start playing something.
      </MemberListEmpty>
    );
  return (
    <ManagedShelf
      kind="now_playing"
      entries={entries}
      offset={offset}
      wide
      gridClass="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      renderCard={(entry) => <OpenBook entry={entry} showSince />}
    />
  );
}

export function OwnedBacklog({
  entries,
  offset,
}: {
  entries: UserBacklog[];
  offset: number;
}) {
  if (entries.length === 0)
    return (
      <MemberListEmpty>
        Nothing in the backlog yet. Add a game to queue it up.
      </MemberListEmpty>
    );
  return (
    <ManagedShelf
      kind="backlog"
      entries={entries}
      offset={offset}
      gridClass={memberGridClass}
      renderCard={(entry, place) => {
        const added = shortDate(entry.created_at);
        return (
          <MemberGameCard
            game={entry.game}
            platform={entry.platform}
            note={entry.note}
            numeral={place}
            meta={added ? <>Queued {added}</> : undefined}
          />
        );
      }}
    />
  );
}

// The owner's Favorites run as one ranked grid, so every rank (the top
// three too) is moved the same way.
export function OwnedFavorites({
  entries,
  offset,
}: {
  entries: UserFavorite[];
  offset: number;
}) {
  if (entries.length === 0)
    return (
      <MemberListEmpty>
        No favorites yet. Add the games you love most.
      </MemberListEmpty>
    );
  return (
    <ManagedShelf
      kind="favorite"
      entries={entries}
      offset={offset}
      gridClass={memberGridClass}
      renderCard={(entry, place) => (
        <MemberGameCard
          game={entry.game}
          platform={entry.platform}
          note={entry.note}
          numeral={place}
        />
      )}
    />
  );
}
