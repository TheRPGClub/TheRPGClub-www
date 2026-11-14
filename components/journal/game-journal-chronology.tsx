"use client";

import type { CSSProperties } from "react";
import { journalDate, romanNumeral } from "@/lib/journals";
import { MemberAvatar } from "@/components/issue/member-cover";
import { Button } from "@/components/ui/button";
import type { PlateLine } from "@/components/journal/game-journal-plate";
import { cn } from "@/lib/utils";

export const CHRONOLOGY_COLS =
  "grid grid-cols-[22px_96px_minmax(0,1fr)_28px] items-center gap-x-2.5 sm:grid-cols-[28px_150px_minmax(0,1fr)_34px] sm:gap-x-3";

// One member's chapter line on the chronology plate: their number and name,
// the line from their first entry to their latest with a mark per entry (a
// diamond where a Game Completion was logged that day), and their count.
// The whole row picks the member; a mark picks that entry.
export function ChronologyLine({
  line,
  index,
  on,
  pickedEntryId,
  numbered,
  onChoose,
}: {
  line: PlateLine;
  index: number;
  // This member's entries are open on the reader.
  on: boolean;
  pickedEntryId: number;
  numbered: boolean;
  onChoose: (userId: string, entryId?: number) => void;
}) {
  return (
    <li
      style={{ "--ink": line.ink } as CSSProperties}
      onClick={() => onChoose(line.userId)}
      className={cn(
        CHRONOLOGY_COLS,
        "-mx-2 h-[50px] cursor-pointer border-b border-border px-2 transition-colors",
        on ? "bg-muted" : "hover:bg-muted/60",
      )}
    >
      <span className="font-headline text-[1.05rem] text-faint-foreground">{romanNumeral(index + 1)}</span>
      <Button
        variant="row-label"
        onClick={(e) => {
          e.stopPropagation();
          onChoose(line.userId);
        }}
        aria-pressed={on}
        className="flex h-auto min-w-0 justify-start gap-2 p-0 text-left text-[length:inherit]"
      >
        <MemberAvatar userId={line.userId} name={line.name} className="size-6" fallbackClassName="text-xs" />
        <span className="font-label truncate text-[0.95rem]">{line.name}</span>
      </Button>
      <div className="relative h-[30px]">
        {line.marks.length > 1 && (
          <span
            aria-hidden
            className="absolute top-1/2 -mt-px h-0.5 bg-(--ink) opacity-55"
            style={{ left: `${line.start}%`, right: `${100 - line.end}%` }}
          />
        )}
        {line.marks.map((mark) => {
          const sel = on && mark.entryId === pickedEntryId;
          const idx = line.entries.findIndex((e) => e.entry_id === mark.entryId);
          const n = numbered && idx >= 0 ? line.count - idx : null;
          return (
            <span
              key={mark.entryId}
              style={{ left: `${mark.at}%` }}
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2"
            >
              <Button
                variant={mark.completion ? "mark-completion" : "mark"}
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onChoose(line.userId, mark.entryId);
                }}
                aria-label={`${line.name}, ${n != null ? `entry ${n}, ` : ""}${journalDate(line.entries[idx]?.created_at, true) ?? ""}${mark.completion ? ", Game Completion logged that day" : ""}`}
                aria-pressed={sel}
                className={cn(sel ? "size-[15px]" : "size-[9px] hover:size-3", mark.completion && "rotate-45")}
              />
            </span>
          );
        })}
      </div>
      <span className="font-headline text-right text-[1.25rem]">
        {line.count}
        <span className="sr-only"> {line.count === 1 ? "entry" : "entries"}</span>
      </span>
    </li>
  );
}
