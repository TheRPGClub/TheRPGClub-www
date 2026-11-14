"use client";

import type { Platform } from "@/lib/api/types";
import { COMPLETION_NOTE_MAX, completionPlatformGroups } from "@/lib/completions";
import { COMPLETION_TYPES } from "@/lib/imports/completionator";
import type { useCompletionForm } from "@/hooks/use-completion-form";
import { CompletionDateField } from "@/components/admin/completions/completion-date-field";
import { DeskSelect } from "@/components/admin/desk/desk-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const COMPLETION_LABEL = "font-label block text-[0.82rem] tracking-[0.08em] text-faint-foreground";
const TYPES = [{ options: COMPLETION_TYPES.map((t) => ({ value: t, label: t })) }];

// The completion's own fields under the member and game: its type, the
// platform, when, the playtime, a note, and whether the bot announces it.
export function CompletionFields({ platforms, f }: { platforms: Platform[]; f: ReturnType<typeof useCompletionForm> }) {
  const off = f.locked;
  return (
    <fieldset disabled={off} className="grid gap-x-5 gap-y-5 border-t border-border pt-5 sm:grid-cols-2">
      <div className="space-y-1.5">
        <span id="completion-type-label" className={COMPLETION_LABEL}>
          Completion type
        </span>
        <DeskSelect groups={TYPES} value={f.completionType} onValueChange={f.setCompletionType} labelledBy="completion-type-label" disabled={off} />
      </div>

      <div className="space-y-1.5">
        <span id="completion-platform-label" className={COMPLETION_LABEL}>
          Platform
        </span>
        <DeskSelect
          groups={[{ options: [{ value: "", label: "No platform" }] }, ...completionPlatformGroups(platforms, f.game)]}
          value={f.platformId}
          onValueChange={f.setPlatformId}
          labelledBy="completion-platform-label"
          disabled={off}
        />
      </div>

      <CompletionDateField
        label={COMPLETION_LABEL}
        choice={f.dateChoice}
        onChoiceChange={f.setDateChoice}
        date={f.customDate}
        onDateChange={f.setCustomDate}
        disabled={off}
      />

      <Label variant="frame" className="space-y-1.5">
        <span className={COMPLETION_LABEL}>Final playtime (hours)</span>
        <Input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={f.playtime}
          onChange={(e) => f.setPlaytime(e.target.value)}
          placeholder="Unknown"
          aria-invalid={!f.playtimeOk || undefined}
        />
      </Label>

      <Label variant="frame" className="space-y-1.5 sm:col-span-2">
        <span className={COMPLETION_LABEL}>Note (optional)</span>
        <Textarea
          rows={2}
          maxLength={COMPLETION_NOTE_MAX}
          value={f.note}
          onChange={(e) => f.setNote(e.target.value)}
          className="inline-block min-h-0 px-3 text-sm field-sizing-fixed md:text-sm"
        />
        <span className="block text-xs text-faint-foreground">Kept on the profile; the post leaves it out.</span>
      </Label>

      <Label variant="ruled" className="flex items-start gap-3 border-y py-3.5 sm:col-span-2">
        <Checkbox checked={f.announce} onCheckedChange={f.setAnnounce} disabled={off} className="mt-1" />
        <span>
          <span className="block font-semibold">Announce it in Whatcha Playing</span>
          <span className="block text-sm text-faint-foreground">
            The bot posts it as the proof shows, naming you as the one who logged it.
          </span>
        </span>
      </Label>
    </fieldset>
  );
}
