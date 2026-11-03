"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { JournalEntry } from "@/lib/api/types";
import { chapterHref, journalDate, journalDateRange, romanNumeral } from "@/lib/journals";
import type { ChronologyMark } from "@/lib/journals";
import { MemberAvatar } from "@/components/issue/member-cover";
import { JournalFolio, JournalPage, JournalRunningHead } from "@/components/journal/journal-book";
import { JournalEntryView } from "@/components/journal/journal-entry";
import { buttonVariants } from "@/components/ui/button";
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
}: {
  gameId: number;
  lines: PlateLine[];
  ticks: { label: string; at: number }[];
  span: string;
  // Entry numbers are exact only when the whole journal was read.
  numbered: boolean;
}) {
  const [pick, setPick] = useState<{ userId: string; entryId: number }>(() => ({
    userId: lines[0].userId,
    entryId: lines[0].entries[0]?.entry_id ?? 0,
  }));
  const lineIndex = Math.max(0, lines.findIndex((l) => l.userId === pick.userId));
  const line = lines[lineIndex];
  const from = Math.max(0, line.entries.findIndex((e) => e.entry_id === pick.entryId));
  const shown = line.entries.slice(from, from + READER_WINDOW);
  const numberAt = (i: number) => (numbered ? line.count - i : null);

  const choose = (userId: string, entryId?: number) => {
    const target = lines.find((l) => l.userId === userId);
    if (!target) return;
    setPick({ userId, entryId: entryId ?? target.entries[0]?.entry_id ?? 0 });
  };

  const COLS =
    "grid grid-cols-[22px_96px_minmax(0,1fr)_28px] items-center gap-x-2.5 sm:grid-cols-[28px_150px_minmax(0,1fr)_34px] sm:gap-x-3";

  return (
    <div className="grid gap-1.5 lg:min-h-[470px] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-0">
      <JournalPage side="left" className="px-4 pb-4 sm:px-6">
        <JournalRunningHead parts={["Chronology"]} note={span} />
        <h3 className="font-headline mt-4 mb-1 text-[1.6rem] leading-[0.9]">
          One chapter per member
        </h3>
        <p className="mb-3 text-[0.88rem] text-paper-mute">
          Each line runs from a member&apos;s first entry on this game to their latest.
        </p>
        <div className="border-t-2 border-paper pt-1">
          <div aria-hidden className={cn(COLS, "h-[30px] border-b border-rule py-1.5")}>
            <span />
            <span />
            <div className="relative h-[18px]">
              {ticks.map((tick) => (
                <span
                  key={`${tick.label}-${tick.at}`}
                  style={{ left: `${tick.at}%` }}
                  className="font-label absolute top-px text-[0.76rem] tracking-[0.08em] text-paper-mute before:absolute before:-top-[7px] before:-left-1.5 before:h-[30px] before:border-l before:border-rule"
                >
                  {tick.label}
                </span>
              ))}
            </div>
            <span />
          </div>
          <ol>
            {lines.map((l, i) => {
              const on = l.userId === line.userId;
              return (
                <li
                  key={l.userId}
                  style={{ "--ink": l.ink } as CSSProperties}
                  onClick={() => choose(l.userId)}
                  className={cn(
                    COLS,
                    "-mx-2 h-[50px] cursor-pointer border-b border-rule px-2 transition-colors",
                    on ? "bg-ink-3" : "hover:bg-ink-3/60",
                  )}
                >
                  <span className="font-headline text-[1.05rem] text-paper-mute">
                    {romanNumeral(i + 1)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      choose(l.userId);
                    }}
                    aria-pressed={on}
                    className="flex min-w-0 items-center gap-2 text-left focus-visible:ring-3 focus-visible:ring-highlight/50 focus-visible:outline-none"
                  >
                    <MemberAvatar
                      userId={l.userId}
                      name={l.name}
                      className="size-6"
                      fallbackClassName="text-xs"
                    />
                    <span className="font-label truncate text-[0.95rem]">{l.name}</span>
                  </button>
                  <div className="relative h-[30px]">
                    {l.marks.length > 1 && (
                      <span
                        aria-hidden
                        className="absolute top-1/2 -mt-px h-0.5 bg-(--ink) opacity-55"
                        style={{ left: `${l.start}%`, right: `${100 - l.end}%` }}
                      />
                    )}
                    {l.marks.map((mark) => {
                      const sel = on && mark.entryId === pick.entryId;
                      const idx = l.entries.findIndex((e) => e.entry_id === mark.entryId);
                      const entry = l.entries[idx];
                      const n = numbered && idx >= 0 ? l.count - idx : null;
                      return (
                        <button
                          key={mark.entryId}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            choose(l.userId, mark.entryId);
                          }}
                          aria-label={`${l.name}, ${n != null ? `entry ${n}, ` : ""}${journalDate(entry?.created_at, true) ?? ""}${mark.completion ? ", Game Completion logged that day" : ""}`}
                          aria-pressed={sel}
                          style={{ left: `${mark.at}%` }}
                          className={cn(
                            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--ink) focus-visible:ring-3 focus-visible:ring-highlight/60 focus-visible:outline-none",
                            sel ? "size-[15px]" : "size-[9px] hover:size-3",
                            mark.completion ? "rotate-45 rounded-[1.5px]" : "rounded-full",
                            sel &&
                              "shadow-[0_0_0_3px_var(--color-ink-3),0_0_0_5px_var(--color-highlight)]",
                          )}
                        />
                      );
                    })}
                  </div>
                  <span className="font-headline text-right text-[1.25rem]">
                    {l.count}
                    <span className="sr-only"> {l.count === 1 ? "entry" : "entries"}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="font-label mt-auto flex flex-wrap gap-x-4.5 gap-y-1.5 pt-2.5 text-[0.76rem] text-paper-mute">
          <span className="flex items-center gap-1.5">
            <i aria-hidden className="size-2 rounded-full bg-paper-dim" />
            Journal entry
          </span>
          <span className="flex items-center gap-1.5">
            <i aria-hidden className="size-2 rotate-45 rounded-[1px] bg-paper-dim" />
            Game Completion logged that day
          </span>
          <span className="sm:ml-auto">Pick a line or a mark to read</span>
        </div>
      </JournalPage>

      <JournalPage
        as="section"
        side="right"
        aria-label={`${line.name}'s chapter`}
        className="px-4 pb-4 sm:px-7"
      >
        <JournalRunningHead
          parts={[`Chapter ${romanNumeral(lineIndex + 1)}`, line.name]}
          note={`${line.count} ${line.count === 1 ? "entry" : "entries"}`}
        />
        <div className="mt-4 mb-0.5 flex items-center gap-2.5">
          <MemberAvatar userId={line.userId} name={line.name} className="size-8" fallbackClassName="text-sm" />
          <h3 className="font-headline min-w-0 truncate text-[1.6rem] leading-[0.9]">{line.name}</h3>
        </div>
        <p className="mb-3 text-[0.88rem] text-paper-mute">
          {journalDateRange(line.firstAt, line.lastAt)} · newest first
        </p>
        <div className="border-t-2 border-paper">
          {shown.map((entry, i) => (
            <JournalEntryView
              key={entry.entry_id}
              entry={entry}
              number={numberAt(from + i)}
              selected={i === 0}
              clamp={i === 0 ? 3 : 2}
              className={cn("py-3", i > 0 && "border-t border-rule")}
            />
          ))}
        </div>
        <JournalFolio
          action={
            <Link
              href={chapterHref(line.userId, gameId)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Read {line.name}&apos;s chapter
              <ArrowRight aria-hidden />
            </Link>
          }
        >
          <span>
            {numbered
              ? `Entries ${line.count - from}${shown.length > 1 ? `–${line.count - from - shown.length + 1}` : ""} of ${line.count}`
              : `${shown.length} of ${line.count} entries`}
          </span>
        </JournalFolio>
      </JournalPage>
    </div>
  );
}
