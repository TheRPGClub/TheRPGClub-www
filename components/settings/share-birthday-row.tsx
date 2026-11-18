"use client";

import type { BirthdayShareSwitch } from "@/lib/birth-date";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { PreferenceRow } from "@/components/feature/preference-row";

const ROW = "share-birthday";

// /settings, under the Birth Date (design pick A): "Share my Birthday", a
// ruled row with the Features list's switch, saving on flip. It says who
// sees what; without a Birth Date the switch dims and the row says to add
// the day and month first. The twice-a-month limit never holds it.
export function ShareBirthdayRow({
  state,
  pending,
  error,
  onChange,
}: {
  state: BirthdayShareSwitch;
  pending: boolean;
  error: string | null;
  onChange: (next: boolean) => void;
}) {
  return (
    <ul className="border-t border-border">
      <PreferenceRow
        id={ROW}
        name="Share my Birthday"
        badge={null}
        where={state.line}
        dim={!state.checked}
        error={error ?? undefined}
      >
        <FeatureSwitch
          checked={state.checked}
          pending={pending}
          unavailable={state.unavailable}
          onChange={onChange}
          onLabel="On"
          offLabel="Off"
          labelledBy={`pref-${ROW}-name`}
          describedBy={`pref-${ROW}-where`}
        />
      </PreferenceRow>
    </ul>
  );
}
