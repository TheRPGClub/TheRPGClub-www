"use client";

import { useState } from "react";
import type { JournalEntry } from "@/lib/api/types";
import type { ChronologyMark } from "@/lib/journals";
import { JournalPage, JournalRunningHead } from "@/components/journal/journal-book";
import { GameJournalReader } from "@/components/journal/game-journal-reader";
import { CHRONOLOGY_COLS, ChronologyLine } from "@/components/journal/game-journal-chronology";
import { cn } from "@/lib/utils";

export interface PlateLine {
  userId: string;
  name: string;
  ink: string;
  count: number;
  marks: ChronologyMark[];
  start: number;
  end: number;
  firstAt: string;
  lastAt: string;
  // The member's entries on this game, newest first (bodies trimmed).
  entries: JournalEntry[];
}

// How many entries the reader page shows from the picked one back.
const READER_WINDOW = 3;

// The game page's chronology plate beside the reader: one chapter line per
// member from their first entry to their latest, a dot per entry and a
// diamond where a Game Completion was logged that day. Picking a line or a
// mark opens that member's entries on the right page.
export function GameJournalPlate({
  gameId,
  lines,
  ticks,
  span,
  numbered,
  completionKey,
}: {
  gameId: number;
  lines: PlateLine[];
  ticks: { label: string; at: number }[];
  span: string;
  // Entry numbers are exact only when the whole journal was read.
  numbered: boolean;
  // The legend's Game Completion diamond; off while Game Completions isn't
  // shown (no diamonds then).
  completionKey: boolean;
}) {
  const [pick, setPick] = useState<{ userId: string; entryId: number }>(() => ({
    userId: lines[0].userId,
    entryId: lines[0].entries[0]?.entry_id ?? 0,
  }));
  const lineIndex = Math.max(0, lines.findIndex((l) => l.userId === pick.userId));
  const line = lines[lineIndex];
  const from = Math.max(0, line.entries.findIndex((e) => e.entry_id === pick.entryId));
  const shown = line.entries.slice(from, from + READER_WINDOW);

  const choose = (userId: string, entryId?: number) => {
    const target = lines.find((l) => l.userId === userId);
    if (!target) return;
    setPick({ userId, entryId: entryId ?? target.entries[0]?.entry_id ?? 0 });
  };

  return (
    <div className="grid gap-1.5 lg:min-h-[470px] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-0">
      <JournalPage side="left" className="px-4 pb-4 sm:px-6">
        <JournalRunningHead parts={["Chronology"]} note={span} />
        <h3 className="font-headline mt-4 mb-1 text-[1.6rem] leading-[0.9]">
          One chapter per member
        </h3>
        <p className="mb-3 text-[0.88rem] text-faint-foreground">
          Each line runs from a member&apos;s first entry on this game to their latest.
        </p>
        <div className="border-t-2 border-foreground pt-1">
          <div aria-hidden className={cn(CHRONOLOGY_COLS, "h-[30px] border-b border-border py-1.5")}>
            <span />
            <span />
            <div className="relative h-[18px]">
              {ticks.map((tick) => (
                <span
                  key={`${tick.label}-${tick.at}`}
                  style={{ left: `${tick.at}%` }}
                  className="font-label absolute top-px text-[0.76rem] tracking-[0.08em] text-faint-foreground before:absolute before:-top-[7px] before:-left-1.5 before:h-[30px] before:border-l before:border-border"
                >
                  {tick.label}
                </span>
              ))}
            </div>
            <span />
          </div>
          <ol>
            {lines.map((l, i) => (
              <ChronologyLine
                key={l.userId}
                line={l}
                index={i}
                on={l.userId === line.userId}
                pickedEntryId={pick.entryId}
                numbered={numbered}
                onChoose={choose}
              />
            ))}
          </ol>
        </div>
        <div className="font-label mt-auto flex flex-wrap gap-x-4.5 gap-y-1.5 pt-2.5 text-[0.76rem] text-faint-foreground">
          <span className="flex items-center gap-1.5">
            <i aria-hidden className="size-2 rounded-full bg-dim-foreground" />
            Journal entry
          </span>
          {completionKey && (
            <span className="flex items-center gap-1.5">
              <i aria-hidden className="size-2 rotate-45 rounded-[1px] bg-dim-foreground" />
              Game Completion logged that day
            </span>
          )}
          <span className="sm:ml-auto">Pick a line or a mark to read</span>
        </div>
      </JournalPage>

      <GameJournalReader
        gameId={gameId}
        line={line}
        lineIndex={lineIndex}
        from={from}
        shown={shown}
        numbered={numbered}
      />
    </div>
  );
}
