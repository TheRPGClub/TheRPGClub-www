import { GitCompareArrows } from "lucide-react";
import type { MemberProfile } from "@/lib/members/profile-page";
import { resolveEntryId } from "@/lib/api/game-list-entry";
import { MemberShelf, Spine } from "@/components/issue/member-shelf";
import {
  completionMonth,
  memberListHref,
  monthShort,
} from "@/components/member/member-lists";
import { mobileCut, shelfMore, spineHref } from "@/components/member/profile/shelf-parts";

// The completed shelf, newest on the left, each spine tagged with its month;
// another member's can be compared with the viewer's.
export function CompletedShelf({ profile }: { profile: MemberProfile }) {
  const { user, counts, session, isSelf } = profile;
  const entries = profile.lists.completed.data;
  return (
    <MemberShelf
      label="Completed"
      count={counts.completed}
      blurb="Newest on the left."
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
        return (
          <Spine
            key={resolveEntryId("completed", entry) ?? i}
            href={spineHref(entry)}
            game={entry.game}
            title={entry.game?.title ?? "Unknown game"}
            tag={month ? `${monthShort(month)} ${month.slice(2, 4)}` : null}
            className={mobileCut(i)}
          />
        );
      })}
    </MemberShelf>
  );
}
