"use client";

import type { ChallengeListNotice } from "@/lib/challenges/types";
import { Button } from "@/components/ui/button";
import { InboxRow } from "@/components/challenges/proposals/inbox-row";

// A list notice (api#448, pick 9A's notice row): a Core Game whose entry
// left the linked Game List, for whoever decides to take out of the Pool or
// keep.
export function NoticeRow({
  notice,
  listName,
  pending,
  onSettle,
}: {
  notice: ChallengeListNotice;
  listName: string;
  pending: boolean;
  onSettle: (choice: "remove" | "keep") => void;
}) {
  if (!notice.game) return null;
  return (
    <InboxRow
      game={notice.game}
      title={`${notice.game.title} left ${listName}`}
      meta={<span>It was removed from the list, and it&apos;s still a Core Game here.</span>}
      actions={
        <>
          <Button size="sm" variant="destructive-outline" disabled={pending} onClick={() => onSettle("remove")}>
            Remove from the Pool
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => onSettle("keep")}>
            Keep it
          </Button>
        </>
      }
    />
  );
}
