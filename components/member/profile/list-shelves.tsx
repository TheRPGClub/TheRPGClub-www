import { Dices } from "lucide-react";
import type { MemberProfile } from "@/lib/members/profile-page";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import { MemberShelf, Spine } from "@/components/issue/member-shelf";
import { platformShort } from "@/components/issue/member-cover";
import { memberListHref } from "@/lib/members/member-lists";
import type { GameCollection, UserBacklog } from "@/lib/api/types";
import { addedMonth, type ShelfAdded, type ShelfPlaytime } from "@/lib/members/profile-playtime";
import {
  MOST_PLAYED_BLURB,
  mobileCut,
  shelfMore,
  spineHours,
  spineHref,
  spineLift,
} from "@/components/member/profile/shelf-parts";
import { ShelfPlaytimeHead } from "@/components/member/profile/shelf-playtime-head";
import { SpineLiftRow } from "@/components/member/profile/spine-lift-row";

// The backlog and collection shelves: a row of spines, each tagged with its
// platform (or, sorted Most played, its hours). A lifted spine's tag says
// when it was added ("Backlogged Sep 26"); an older API without the date
// names the platform instead ("Backlog · PS4").

type Entry = (UserBacklog | GameCollection) & ShelfPlaytime & ShelfAdded;

function spines(entries: Entry[], kind: "backlog" | "collection", mostPlayed: boolean, sub: string, verb: string) {
  return entries.map((entry, i) => {
    const platform = platformShort(entry.platform);
    const added = addedMonth(entry.added_at);
    return (
      <Spine
        key={resolveEntryId(kind, entry) ?? i}
        href={spineHref(entry)}
        game={entry.game}
        title={entry.game?.title ?? "Unknown game"}
        tag={mostPlayed ? spineHours(entry.playtime_minutes) : platform}
        lift={spineLift(entry.playtime_minutes, added ? `${verb} ${added}` : platform ? `${sub} · ${platform}` : sub)}
        className={mobileCut(i)}
      />
    );
  });
}

export function BacklogShelf({ profile }: { profile: MemberProfile }) {
  const { user, counts, isSelf, playtime, sorts } = profile;
  const entries = profile.lists.backlog.data;
  const mostPlayed = sorts.backlog === "most_played";
  return (
    <MemberShelf
      label="Backlog"
      count={counts.backlog}
      blurb={mostPlayed ? MOST_PLAYED_BLURB : "Queued up."}
      aside={
        <ShelfPlaytimeHead
          userId={user.user_id}
          shelf="backlog"
          label="Backlog"
          minutes={playtime?.shelves.backlog}
          sorts={sorts}
          ownOrder="Queued"
        />
      }
      Row={SpineLiftRow}
      links={[
        { href: memberListHref(user.user_id, "backlog"), label: "Open list" },
        ...(isSelf
          ? [
              {
                href: `/members/${user.user_id}/backlogged-games/pick`,
                label: "Pick one at random",
                icon: <Dices aria-hidden />,
              },
            ]
          : []),
      ]}
      more={shelfMore(user.user_id, "backlog", counts.backlog, entries.length)}
      empty="Nothing queued up."
    >
      {spines(entries, "backlog", mostPlayed, "Backlog", "Backlogged")}
    </MemberShelf>
  );
}

export function CollectionShelf({ profile }: { profile: MemberProfile }) {
  const { user, counts, playtime, sorts } = profile;
  const entries = profile.lists.collection.data;
  const mostPlayed = sorts.collection === "most_played";
  return (
    <MemberShelf
      label="Collection"
      count={counts.collection}
      blurb={mostPlayed ? MOST_PLAYED_BLURB : "Owned, newest on the left."}
      aside={
        <ShelfPlaytimeHead
          userId={user.user_id}
          shelf="collection"
          label="Collection"
          minutes={playtime?.shelves.collection}
          sorts={sorts}
          ownOrder="Newest"
        />
      }
      Row={SpineLiftRow}
      links={[{ href: memberListHref(user.user_id, "collection"), label: "Open list" }]}
      more={shelfMore(user.user_id, "collection", counts.collection, entries.length)}
      empty="No owned games tracked."
    >
      {spines(entries, "collection", mostPlayed, "Owned", "Added")}
    </MemberShelf>
  );
}
