import type { UserBacklog } from "@/lib/api/types";
import { shortDate } from "@/components/member/member-lists";
import {
  MemberGameCard,
  MemberListEmpty,
  memberGridClass,
} from "@/components/member/member-game-card";

// What's queued up, in the member's order, each with its note and when it
// went on the list.
export function BacklogGrid({ entries }: { entries: UserBacklog[] }) {
  if (entries.length === 0) {
    return <MemberListEmpty>Nothing in the backlog yet.</MemberListEmpty>;
  }
  return (
    <ul className={memberGridClass}>
      {entries.map((entry, i) => {
        const added = shortDate(entry.created_at);
        return (
          <li key={entry.entry_id ?? entry.backlog_id ?? i}>
            <MemberGameCard
              game={entry.game}
              platform={entry.platform}
              note={entry.note}
              meta={added ? <>Queued {added}</> : undefined}
            />
          </li>
        );
      })}
    </ul>
  );
}
