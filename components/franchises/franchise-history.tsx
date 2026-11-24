"use client";

import Link from "next/link";
import { Lock, Undo2 } from "lucide-react";
import { changeUndo, changeWhen, describeChange } from "@/lib/franchises/page";
import type { FranchiseChange } from "@/lib/franchises/types";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// The History view (design pick 6C): every change down a paper line, newest
// first, each a node with who did what and when. Regulars and above get
// Undo on a change that can still be undone; merges, deletes and creates
// say they can't. An undone change is struck through with who undid it.
export function FranchiseHistory({
  changes,
  total,
  now,
  editor,
}: {
  changes: FranchiseChange[];
  total: number;
  now: string;
  editor: FranchiseEditor;
}) {
  const at = new Date(now);
  if (changes.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-dim-foreground">
        No one has changed this Franchise yet. Its games are as IGDB has them.
      </p>
    );
  }
  return (
    <div className="max-w-215">
      {editor.error && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {editor.error}
        </p>
      )}
      <ol aria-label="Changes, newest first" className="relative ml-1.5 border-l-2 border-foreground">
        {changes.map((c) => {
          const undo = changeUndo(c);
          return (
            <li
              key={c.change_id}
              className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 border-b border-border py-3 pl-5 last:border-b-0"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-[1.15rem] -left-[7px] size-3 rounded-full border-2 border-foreground",
                  c.undone_at ? "bg-background" : "bg-foreground",
                )}
              />
              <div className={cn("min-w-0 text-[0.94rem] leading-[1.4] text-dim-foreground", c.undone_at && "opacity-60")}>
                <p className={cn(c.undone_at && "line-through decoration-faint-foreground")}>
                  <Who id={c.user_id} name={c.username} />{" "}
                  {describeChange(c).map((part, i) =>
                    part.strong ? (
                      <b key={i} className="font-semibold text-foreground">
                        {part.text}
                      </b>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                  )}
                </p>
                <p className="font-label mt-1 text-[0.74rem] font-bold tracking-[0.07em] text-faint-foreground">
                  {changeWhen(c.created_at, at)}
                  {c.undone_at && ` · undone by ${c.undone_by_username ?? "a member"}`}
                </p>
              </div>
              {undo === "undo" ? (
                <Button
                  variant="outline"
                  size="xs"
                  disabled={editor.pending}
                  onClick={() => editor.undo(c.change_id)}
                  aria-label={`Undo: ${describeChange(c).map((p) => p.text).join("")}`}
                >
                  <Undo2 data-icon="inline-start" />
                  {editor.busy === `undo:${c.change_id}` ? "Undoing…" : "Undo"}
                </Button>
              ) : undo === "never" ? (
                <span className="font-label inline-flex items-center gap-1 pt-1 text-[0.72rem] font-bold tracking-[0.07em] whitespace-nowrap text-faint-foreground">
                  <Lock aria-hidden className="size-3" />
                  Can&apos;t undo
                </span>
              ) : (
                <span />
              )}
            </li>
          );
        })}
      </ol>
      {total > changes.length && (
        <p className="mt-3 text-sm text-faint-foreground">
          The latest {changes.length} of {total} changes.
        </p>
      )}
    </div>
  );
}

function Who({ id, name }: { id: string | null; name: string | null }) {
  if (!id) return <b className="font-semibold text-foreground">The club</b>;
  return (
    <Link href={`/members/${id}`} className="font-semibold text-foreground hover:text-highlight">
      {name ?? "A member"}
    </Link>
  );
}
