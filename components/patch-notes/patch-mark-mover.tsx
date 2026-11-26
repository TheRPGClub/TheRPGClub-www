"use client";

import { useEffect } from "react";
import { movePatchMarkAction } from "@/app/actions/patch-mark";
import { notePatchMarkMoved } from "@/hooks/use-patch-unseen";

// Moves the member's Patch Mark to `shown` once the page is open in the
// browser (ticket www#238): never on the server, so a prefetch or a crawler
// moves nothing. The page keeps its NEW chips for this visit; the sidebar
// clears as soon as the API answers, and the next visit reads as seen on
// every device. A failure says nothing and leaves the mark where it was.
// Rendered only when `shown` is past the mark (shouldMovePatchMark).

// Numbers sent in this tab: a remount (Strict Mode, a re-render) never
// sends the same move twice.
const sent = new Set<number>();

export function PatchMarkMover({ shown }: { shown: number }) {
  useEffect(() => {
    if (sent.has(shown)) return;
    sent.add(shown);
    movePatchMarkAction(shown)
      .then((answer) => {
        if (answer) notePatchMarkMoved(answer);
        else sent.delete(shown);
      })
      .catch(() => sent.delete(shown));
  }, [shown]);
  return null;
}
