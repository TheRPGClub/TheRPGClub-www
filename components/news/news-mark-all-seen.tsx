"use client";

import { useActionState } from "react";
import { markAllSeenAction, type MarkAllSeenState } from "@/app/actions/news-mark";
import { Button } from "@/components/ui/button";

// Mark all seen in the masthead's tools (ticket www#222): moves the member's
// News Mark to now. A form post, so it works before the page hydrates; once
// it has, the action's redirect re-renders Catch-up in place as caught up.
// `back` is the News page address to come back to (Show all leaves for
// Catch-up).

export function NewsMarkAllSeen({ back }: { back: string }) {
  const [state, formAction, pending] = useActionState(markAllSeenAction.bind(null, back), {
    error: null,
  } satisfies MarkAllSeenState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Button type="submit" variant="link" size="sm" disabled={pending} className="cursor-pointer px-1">
        <span className="font-label font-bold tracking-[0.07em] uppercase">
          {pending ? "Marking…" : "Mark all seen"}
        </span>
      </Button>
      {state.error && (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
