"use client";

import { Check, LoaderCircle, Plus } from "lucide-react";
import type { ThreadSearchResult } from "@/lib/api/types";
import { threadLinkState } from "@/lib/game-links";
import { Button } from "@/components/ui/button";

// One thread in the link picker's results: its name, the other games it is
// linked to, and Link (or "Linked" when it is on this game already).
export function ThreadResult({
  thread,
  gameId,
  busy,
  disabled,
  onLink,
}: {
  thread: ThreadSearchResult;
  gameId: number;
  busy: boolean;
  disabled: boolean;
  onLink: () => void;
}) {
  const { linkedHere, others } = threadLinkState(thread, gameId);
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border px-3 py-2 text-sm first:border-t-0">
      <span className="min-w-0">
        <span className="block truncate font-semibold">{thread.thread_name}</span>
        {others.length > 0 && (
          <span className="block truncate text-xs text-faint-foreground">
            Also on {others.join(", ")}
          </span>
        )}
      </span>
      {linkedHere ? (
        <span className="font-label flex items-center gap-1 px-2 text-[0.75rem] font-extrabold tracking-[0.08em] text-faint-foreground">
          <Check aria-hidden className="size-3.5" />
          Linked
        </span>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled}
          onClick={onLink}
          aria-label={`Link ${thread.thread_name}`}
        >
          {busy ? (
            <LoaderCircle data-icon="inline-start" className="motion-safe:animate-spin" />
          ) : (
            <Plus data-icon="inline-start" />
          )}
          Link
        </Button>
      )}
    </li>
  );
}
