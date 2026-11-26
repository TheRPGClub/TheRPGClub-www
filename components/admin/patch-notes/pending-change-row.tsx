"use client";

import { CornerDownRight, Loader2 } from "lucide-react";

import { repoName, type PendingChange } from "@/lib/patch-notes/pending-changes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// One Pending Change in step 1 (www#240): the tick, the repo chip and PR
// number, the pull request's title, the bullet it drafts (its Patch note
// line, or the title when it has none) and its version. An open one can be
// dismissed; a dismissed one, brought back.
export function PendingChangeRow({
  change,
  busy,
  locked,
  onTick,
  onDismiss,
}: {
  change: PendingChange;
  // This row's write is running.
  busy: boolean;
  // Another write is running.
  locked: boolean;
  onTick: (covered: boolean) => void;
  onDismiss: (undo: boolean) => void;
}) {
  const id = `pending-change-${change.id}`;
  const dismissed = change.status === "dismissed";
  return (
    <li className="flex items-start gap-3.5 border-b border-border py-3.5 last:border-b-0">
      <span className="mt-[3px] grid size-4 shrink-0 place-items-center">
        {busy ? (
          <Loader2 aria-hidden className="size-4 text-faint-foreground motion-safe:animate-spin" />
        ) : (
          !dismissed && (
            <Checkbox id={id} checked={change.status === "covered"} disabled={locked} onCheckedChange={(on) => onTick(on === true)} />
          )
        )}
      </span>
      <label htmlFor={dismissed ? undefined : id} className={cn("flex min-w-0 flex-1 flex-col gap-1", !dismissed && "cursor-pointer")}>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge tone="status" size="sm">
            {repoName(change.repo)}
          </Badge>
          <span className="font-label text-xs font-bold tracking-[0.06em] text-faint-foreground">#{change.pr_number}</span>
          <span className={cn("min-w-0 font-semibold break-words", dismissed ? "text-faint-foreground" : "text-foreground")}>
            {change.title}
          </span>
        </span>
        <span className={cn("flex items-start gap-1.5 text-[0.875rem]", dismissed ? "text-faint-foreground" : "text-dim-foreground")}>
          <CornerDownRight aria-hidden className="mt-[3px] size-3.5 shrink-0 text-faint-foreground" />
          {change.patch_note ? (
            <span className="break-words">{change.patch_note}</span>
          ) : (
            <span className="text-faint-foreground italic">No Patch note line: the bullet drafts from the title</span>
          )}
        </span>
      </label>
      <span className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="font-label text-xs font-semibold tracking-[0.06em] text-faint-foreground">v{change.version}</span>
        {/* A covered one can't be dismissed: untick it first. Its slot
            holds its width, so the versions line up. */}
        <span className="flex justify-end sm:w-[4.5rem]">
          {change.status !== "covered" && (
            <Button type="button" variant="quiet-link" size="xs" disabled={locked} onClick={() => onDismiss(dismissed)}>
              {dismissed ? "Undo" : "Dismiss"}
              <span className="sr-only"> {change.title}</span>
            </Button>
          )}
        </span>
      </span>
    </li>
  );
}
