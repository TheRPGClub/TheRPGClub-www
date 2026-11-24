import { Dices } from "lucide-react";
import type { MemberProfile } from "@/lib/members/profile-page";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import { MemberShelf, Spine } from "@/components/issue/member-shelf";
import { platformShort } from "@/components/issue/member-cover";
import { memberListHref } from "@/lib/members/member-lists";
import { mobileCut, shelfMore, spineHref } from "@/components/member/profile/shelf-parts";

// The backlog and collection shelves: a row of spines, each tagged with its
// platform.

export function BacklogShelf({ profile }: { profile: MemberProfile }) {
  const { user, counts, isSelf } = profile;
  const entries = profile.lists.backlog.data;
  return (
    <MemberShelf
      label="Backlog"
      count={counts.backlog}
      blurb="Queued up."
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
      {entries.map((entry, i) => (
        <Spine
          key={resolveEntryId("backlog", entry) ?? i}
          href={spineHref(entry)}
          game={entry.game}
          title={entry.game?.title ?? "Unknown game"}
          tag={platformShort(entry.platform)}
          className={mobileCut(i)}
        />
      ))}
    </MemberShelf>
  );
}

export function CollectionShelf({ profile }: { profile: MemberProfile }) {
  const { user, counts } = profile;
  const entries = profile.lists.collection.data;
  return (
    <MemberShelf
      label="Collection"
      count={counts.collection}
      blurb="Owned, by platform."
      links={[{ href: memberListHref(user.user_id, "collection"), label: "Open list" }]}
      more={shelfMore(user.user_id, "collection", counts.collection, entries.length)}
      empty="No owned games tracked."
    >
      {entries.map((entry, i) => (
        <Spine
          key={resolveEntryId("collection", entry) ?? i}
          href={spineHref(entry)}
          game={entry.game}
          title={entry.game?.title ?? "Unknown game"}
          tag={platformShort(entry.platform)}
          className={mobileCut(i)}
        />
      ))}
    </MemberShelf>
  );
}
