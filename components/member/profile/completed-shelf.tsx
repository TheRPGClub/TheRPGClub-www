import { GitCompareArrows } from "lucide-react";
import type { MemberProfile } from "@/lib/members/profile-page";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import { MemberShelf, Spine } from "@/components/issue/member-shelf";
import {
  completionMonth,
  memberListHref,
  monthShort,
} from "@/lib/members/member-lists";
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

// The completed shelf, newest on the left (or Most played), each spine
// tagged with its month (or its hours); another member's can be compared
// with the viewer's.
export function CompletedShelf({ profile }: { profile: MemberProfile }) {
  const { user, counts, session, isSelf, playtime, sorts } = profile;
  const entries = profile.lists.completed.data;
  const mostPlayed = sorts.completed === "most_played";
  return (
    <MemberShelf
      label="Completed"
      count={counts.completed}
      blurb={mostPlayed ? MOST_PLAYED_BLURB : "Newest on the left."}
      aside={
        <ShelfPlaytimeHead
          userId={user.user_id}
          shelf="completed"
          label="Completed"
          minutes={playtime?.shelves.completed}
          sorts={sorts}
          ownOrder="Newest"
        />
      }
      Row={SpineLiftRow}
      links={[
        { href: memberListHref(user.user_id, "completed"), label: "Open list" },
        ...(session && !isSelf
          ? [
              {
                href: `/members/${user.user_id}/completed-games/compare`,
                label: "Compare",
                icon: <GitCompareArrows aria-hidden />,
              },
            ]
          : []),
      ]}
      more={shelfMore(user.user_id, "completed", counts.completed, entries.length)}
      empty="No completed games yet."
    >
      {entries.map((entry, i) => {
        const month = completionMonth(entry.completed_at);
        const when = month ? `${monthShort(month)} ${month.slice(2, 4)}` : null;
        return (
          <Spine
            key={resolveEntryId("completed", entry) ?? i}
            href={spineHref(entry)}
            game={entry.game}
            title={entry.game?.title ?? "Unknown game"}
            tag={mostPlayed ? spineHours(entry.playtime_minutes) : when}
            lift={spineLift(entry.playtime_minutes, when ? `Completed ${when}` : "Completed")}
            className={mobileCut(i)}
          />
        );
      })}
    </MemberShelf>
  );
}
