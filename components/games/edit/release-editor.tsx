"use client";

import { useId } from "react";
import type { DatePrecision } from "@/lib/api/types";
import {
  DATE_PRECISION_LABELS,
  DATE_PRECISIONS,
  periodStart,
  RELEASE_FORMATS,
  type ReleaseDraft,
} from "@/lib/games/game-edit/releases";
import type { ReleaseOptions } from "@/lib/games/game-edit/release-options";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DeskSelect } from "@/components/admin/desk/desk-select";
import { ReleaseDateField } from "@/components/games/edit/release-date-field";

const FORMATS = [{ value: "", label: "Any format" }, ...RELEASE_FORMATS.map((f) => ({ value: f, label: f }))];

// A Manual Release open for editing, inline in its row (design www#156
// round 3): platform, region, format, the Date Precision with its date (TBA
// hides it) and notes. Every change stages at once.
export function ReleaseEditor({
  draft,
  options,
  onChange,
}: {
  draft: ReleaseDraft;
  options: ReleaseOptions;
  onChange: (draft: ReleaseDraft) => void;
}) {
  const id = useId();
  const set = (patch: Partial<ReleaseDraft>) => onChange({ ...draft, ...patch });
  const platforms = options.platforms.map((p) => ({ value: String(p.platform_id), label: p.platform_name }));
  const regions = options.regions.map((r) => ({ value: String(r.region_id), label: r.region_name }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span id={`${id}-platform`} className="sr-only">
        Platform
      </span>
      <div className="w-44">
        <DeskSelect
          groups={[{ options: platforms }]}
          value={draft.platform_id ? String(draft.platform_id) : ""}
          placeholder="Platform…"
          labelledBy={`${id}-platform`}
          onValueChange={(v) => {
            const p = options.platforms.find((o) => String(o.platform_id) === v);
            if (p) set(p);
          }}
        />
      </div>
      <span id={`${id}-region`} className="sr-only">
        Region
      </span>
      <div className="w-40">
        <DeskSelect
          groups={[{ options: regions }]}
          value={draft.region_id ? String(draft.region_id) : ""}
          placeholder="Region…"
          labelledBy={`${id}-region`}
          onValueChange={(v) => {
            const r = options.regions.find((o) => String(o.region_id) === v);
            if (r) set(r);
          }}
        />
      </div>
      <span id={`${id}-format`} className="sr-only">
        Format
      </span>
      <div className="w-32">
        <DeskSelect
          groups={[{ options: FORMATS }]}
          value={draft.format ?? ""}
          labelledBy={`${id}-format`}
          onValueChange={(v) => set({ format: v || null })}
        />
      </div>
      <ToggleGroup
        aria-label="Date Precision"
        variant="switcher"
        spacing={0.5}
        value={[draft.date_precision]}
        onValueChange={(next) => {
          const precision = DATE_PRECISIONS.find((p) => p === next[0]) as DatePrecision | undefined;
          if (precision) set({ date_precision: precision, release_date: periodStart(draft.release_date, precision) });
        }}
      >
        {DATE_PRECISIONS.map((p) => (
          <ToggleGroupItem key={p} value={p} className="h-7.5 min-w-0 px-2 text-[0.8rem]">
            {DATE_PRECISION_LABELS[p]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ReleaseDateField
        date={draft.release_date}
        precision={draft.date_precision}
        label="Release date"
        onChange={(release_date) => set({ release_date })}
      />
      <Input
        aria-label="Notes"
        placeholder="Notes"
        value={draft.notes ?? ""}
        onChange={(e) => set({ notes: e.target.value })}
        className="h-8 min-w-28 flex-1"
      />
    </div>
  );
}
