"use client";

import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StagedMark } from "@/components/games/edit/edit-section";

// One field of the Time to beat tab: a time in hours set big in the
// headline face with "hours" after it, or the HowLongToBeat page's link. A
// staged field is ringed in yellow, marked Edited, with an Undo.
export function HltbField({
  id,
  label,
  value,
  edited,
  time,
  onChange,
  onUndo,
}: {
  id: string;
  label: string;
  value: string;
  edited: boolean;
  // A time in hours, rather than the link.
  time?: boolean;
  onChange: (value: string) => void;
  onUndo: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-2 flex min-h-6 items-center gap-2">
        <Label htmlFor={id} className="font-label text-[0.78rem] font-bold tracking-[0.08em]">
          {label}
        </Label>
        {edited && (
          <>
            <StagedMark kind="edited">Edited</StagedMark>
            <Button variant="inline-link" size="inline" onClick={onUndo} className="gap-1 text-[0.8rem]">
              <Undo2 aria-hidden className="mr-1 inline size-3.5" />
              Undo
            </Button>
          </>
        )}
      </div>
      {time ? (
        <div className="relative">
          <Input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            variant={edited ? "staged" : "default"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-11.5 pr-16 font-headline text-[1.7rem]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-label text-[0.8rem] font-bold tracking-[0.08em] text-faint-foreground uppercase"
          >
            hours
          </span>
        </div>
      ) : (
        <Input
          id={id}
          type="url"
          inputMode="url"
          placeholder="https://howlongtobeat.com/game/…"
          variant={edited ? "staged" : "default"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
