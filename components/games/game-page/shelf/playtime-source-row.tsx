"use client";

import { useState } from "react";
import { Gamepad2, Joystick, Monitor, Pencil, Plus, StickyNote, Trash2, type LucideIcon } from "lucide-react";
import type { ManualPlaytimeMode } from "@/lib/playtime/types";
import type { SourceRow } from "@/lib/playtime/view";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MODE_LABEL, PlaytimeAmount } from "./playtime-amount";
import { PlaytimeNote } from "./playtime-note";

const SOURCE_ICONS: Record<string, LucideIcon> = { Steam: Monitor, RetroAchievements: Joystick, PSN: Gamepad2, Manual: Pencil };

// "Steam PC", "Manual Switch": the source in label caps, its platform faint.
export function SourceTag({ source, platform }: { source: string; platform: string | null }) {
  const Icon = SOURCE_ICONS[source] ?? Pencil;
  return (
    <span className="font-label inline-flex items-center gap-1.5 text-[0.78rem] leading-none font-extrabold tracking-[0.07em] whitespace-nowrap text-foreground uppercase [&_svg]:size-3.5 [&_svg]:text-faint-foreground">
      <Icon aria-hidden />
      {source}
      {platform && <span className="font-bold text-faint-foreground">{platform}</span>}
    </span>
  );
}

type Open = ManualPlaytimeMode | "note" | null;

// One source in the editor's breakdown (2D+F): its tag, the set's title or
// the Manual note with when it was set, and its hours. Manual rows carry
// Add time, Set total, a note and Remove; a Provider's figure is never
// edited here. A row in a waiting mismatch is washed in yellow.
export function PlaytimeSourceRow({
  row,
  note,
  pending,
  onSave,
  onNote,
  onRemove,
}: {
  row: SourceRow;
  // The Manual entry's note as stored, for its editor.
  note: string;
  pending: boolean;
  onSave: (mode: ManualPlaytimeMode, minutes: number, done: () => void) => void;
  onNote: (note: string | null, done: () => void) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState<Open>(null);
  const close = () => setOpen(null);
  return (
    <li className={cn("border-b border-border py-2", row.flagged && "-mx-2 bg-highlight/7 px-2")}>
      <div className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-2.5 gap-y-0.5">
        <SourceTag source={row.source} platform={row.platform} />
        <span className={cn("font-display row-span-2 text-right text-[1.45rem] leading-none", !row.counted && "text-faint-foreground line-through")}>{row.hours}</span>
        <p className="min-w-0 truncate text-[0.84rem] text-dim-foreground">
          {row.detail}
          {row.meta && <span className="font-label ml-1 text-[0.7rem] font-bold tracking-[0.07em] text-faint-foreground uppercase">{row.meta}</span>}
        </p>
      </div>
      {row.kind === "manual" && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {(["add", "set"] as const).map((mode) => (
            <Button key={mode} variant="outline" size="xs" aria-expanded={open === mode} onClick={() => setOpen(open === mode ? null : mode)}>
              {mode === "add" && <Plus aria-hidden />}
              {MODE_LABEL[mode]}
            </Button>
          ))}
          <Button variant="outline" size="xs" aria-expanded={open === "note"} onClick={() => setOpen(open === "note" ? null : "note")}>
            <StickyNote aria-hidden />
            Note
          </Button>
          <Button variant="destructive-ghost" size="icon-xs" aria-label={`Remove your ${row.platform} Manual Playtime`} title="Remove" onClick={onRemove} disabled={pending}>
            <Trash2 aria-hidden />
          </Button>
        </div>
      )}
      {(open === "add" || open === "set") && (
        <PlaytimeAmount
          key={open}
          inline
          current={row.minutes}
          initialMode={open}
          pending={pending}
          saveLabel={() => "Save"}
          onCancel={close}
          onSave={(mode, minutes) => onSave(mode, minutes, close)}
        />
      )}
      {open === "note" && <PlaytimeNote initial={note} pending={pending} onCancel={close} onSave={(text) => onNote(text, close)} />}
    </li>
  );
}
