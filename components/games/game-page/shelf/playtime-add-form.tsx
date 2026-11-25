"use client";

import { useId, useState } from "react";
import type { Platform } from "@/lib/api/types";
import type { GamePlaytime, ManualPlaytimeMode } from "@/lib/playtime/types";
import { hoursText, manualMinutesOn, parseHours, platformChoices } from "@/lib/playtime/view";
import { ListOptionSelect } from "@/components/member/member-shelf/list-option-select";
import { PlaytimeAmount } from "./playtime-amount";

// Add Playtime (2D+F): the platform (where the member already has Manual
// Playtime first), then Add or Set total and the hours. Behind "+" and the
// editor's Add Manual Playtime. It only ever changes Manual Playtime.
export function PlaytimeAddForm({
  doc,
  platforms,
  initialPlatform,
  pending,
  onSave,
  onCancel,
}: {
  doc: GamePlaytime | null;
  platforms: Platform[];
  initialPlatform: number | null;
  pending: boolean;
  onSave: (input: { platformId: number | null; mode: ManualPlaytimeMode; minutes: number }) => void;
  onCancel: () => void;
}) {
  const ids = { platform: useId() };
  const [platformId, setPlatformId] = useState<number | null>(initialPlatform);
  const label = "font-label mt-2.5 mb-1.5 block text-[0.78rem] leading-[1.2] font-bold tracking-[0.08em] text-dim-foreground uppercase";
  return (
    <div>
      <label htmlFor={ids.platform} className={label}>
        Platform
      </label>
      <ListOptionSelect<number | null> id={ids.platform} label="Platform" items={platformChoices(doc, platforms)} value={platformId} onValueChange={setPlatformId} />
      <span aria-hidden className={label}>
        Hours
      </span>
      <PlaytimeAmount
        current={manualMinutesOn(doc, platformId)}
        pending={pending}
        saveLabel={(mode, typed) => {
          const minutes = parseHours(typed);
          if (mode === "set") return "Set total";
          return minutes == null ? "Add" : `Add ${hoursText(minutes)}`;
        }}
        onCancel={onCancel}
        onSave={(mode, minutes) => onSave({ platformId, mode, minutes })}
        footnote="Steam, RetroAchievements and PSN fill in on their own; this is for play they don't see."
      />
    </div>
  );
}
