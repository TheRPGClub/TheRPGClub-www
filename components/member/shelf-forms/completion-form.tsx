"use client";

import { useId } from "react";
import { ArrowRight, Check, Flag, Gamepad2, Loader2 } from "lucide-react";
import type { CompletionLog } from "@/hooks/use-completion-log";
import type { Platform } from "@/lib/api/types";
import { spanText, type IsoDay } from "@/lib/shelf-forms/dates";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ListOptionSelect } from "../member-shelf/list-option-select";
import { COMPLETION_CHOICES } from "./choices";
import { DateField } from "./date-field";
import { Slip, SlipError, SlipField } from "./slip";
import { SlipChoices } from "./slip-choices";
import { platformItems } from "./platform-items";

// The Game Completion form on its paper slip (spec api#451, 2D): the big
// Started and Finished blocks with the days between, how far the member got,
// platform, hours and note, then Keep it in Now Playing beside Log it.
export function CompletionForm({
  log,
  titleId,
  title,
  tag,
  lede,
  platforms,
  today,
  onCancel,
  className,
}: {
  log: CompletionLog;
  titleId: string;
  title: string;
  tag?: string;
  lede?: React.ReactNode;
  platforms: Platform[];
  today: IsoDay;
  onCancel: () => void;
  className?: string;
}) {
  const ids = { hours: useId(), note: useId(), keep: useId() };
  const { values, set, problems } = log;
  const span = spanText(values.started, values.finished);

  return (
    <Slip
      titleId={titleId}
      title={title}
      tag={tag}
      lede={lede}
      onClose={onCancel}
      onSubmit={log.submit}
      className={className}
      foot={
        <>
          {log.formError && <SlipError>{log.formError}</SlipError>}
          {log.onNowPlaying && (
            <label htmlFor={ids.keep} className="mr-auto flex cursor-pointer items-center gap-2.5 text-[0.92rem] max-sm:mb-1 max-sm:basis-full">
              <Checkbox id={ids.keep} variant="slip" checked={values.keepNowPlaying} onCheckedChange={(on) => set("keepNowPlaying", on === true)} />
              Keep it in Now Playing
            </label>
          )}
          <Button type="button" variant="inverse-outline" className="max-sm:flex-1" onClick={onCancel} disabled={log.pending}>
            Cancel
          </Button>
          <Button type="submit" variant="inverse" className="max-sm:flex-[2]" disabled={log.pending}>
            {log.pending ? <Loader2 aria-hidden className="motion-safe:animate-spin" /> : log.editing ? <Check aria-hidden /> : <Flag aria-hidden />}
            {log.editing ? "Save" : "Log it"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)_3.25rem_minmax(0,1fr)] items-start">
        <DateField
          variant="block"
          label="Started"
          optional
          value={values.started}
          onChange={(day) => set("started", day)}
          today={today}
          max={values.finished ?? today}
          other={values.finished}
          error={problems.started}
          sub={log.startedFromNowPlaying ? <><Gamepad2 aria-hidden className="size-3" />From Now Playing</> : values.started ? null : "Leave it if unsure"}
        />
        <p className="font-label flex flex-col items-center gap-0.5 pt-7 text-center text-[0.7rem] leading-tight font-bold tracking-[0.07em] text-background/62 uppercase">
          <ArrowRight aria-hidden className="size-4 text-background" />
          {span}
        </p>
        <DateField
          variant="block"
          label="Finished"
          value={values.finished}
          onChange={(day) => set("finished", day)}
          today={today}
          min={values.started}
          max={today}
          other={values.started}
          error={problems.finished}
          sub={values.finished === today ? "Today" : null}
        />
      </div>
      <SlipChoices label="How far" choices={COMPLETION_CHOICES} value={values.completionType} onValueChange={(v) => set("completionType", v)} className="grid-cols-1 sm:grid-cols-3" />
      <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2.5">
        <SlipField label="Platform">
          <ListOptionSelect<number | null> label="Platform" variant="slip" items={platformItems(platforms)} value={values.platformId} onValueChange={(v) => set("platformId", v)} />
        </SlipField>
        <SlipField label="Hours" optional htmlFor={ids.hours} error={problems.playtime}>
          <Input id={ids.hours} variant="slip" inputMode="decimal" placeholder="Hours" value={values.playtime} aria-invalid={problems.playtime ? true : undefined} onChange={(e) => set("playtime", e.target.value)} />
        </SlipField>
      </div>
      <SlipField label="Note" optional htmlFor={ids.note} error={problems.note}>
        <Textarea id={ids.note} variant="slip" rows={2} placeholder="What stuck with you?" value={values.note} aria-invalid={problems.note ? true : undefined} onChange={(e) => set("note", e.target.value)} />
      </SlipField>
    </Slip>
  );
}
