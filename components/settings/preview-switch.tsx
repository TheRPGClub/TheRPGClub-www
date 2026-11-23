"use client";

import { savePreferenceAction } from "@/app/actions/feature-preferences";
import { applyPreferenceChange, type FeaturePreferences } from "@/lib/feature-preferences";
import { Badge } from "@/components/ui/badge";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { PreferenceRow } from "@/components/feature/preference-row";
import { useSwitchSaves } from "@/hooks/use-switch-saves";

const ID = "show_preview";

// "Show Preview features" for Admins and Superadmins, on the Staff tab: a
// raised ink-2 panel, saving on flip like every settings switch. It saves to
// the same Feature Preferences the Features tab does; the action refreshes
// the page, so both read the API's answer.
export function PreviewSwitch({ initial }: { initial: FeaturePreferences }) {
  const { state, pending, errors, save } = useSwitchSaves({
    initial,
    apply: applyPreferenceChange,
    action: savePreferenceAction,
    idOf: () => ID,
  });
  const on = state.show_preview_features === true;

  return (
    <ul className="mt-4 rounded-md border border-border bg-card px-4" aria-label="Staff">
      <PreferenceRow
        id={ID}
        name="Show Preview features"
        badge={<Badge className="border-0">Staff</Badge>}
        where="Preview Features in your sidebar, dashboard and pages. Turn it off to see the site as members do."
        dim={!on}
        error={errors[ID]}
        className="border-b-0"
      >
        <FeatureSwitch
          checked={on}
          pending={pending.has(ID)}
          onChange={(next) => save({ kind: "show_preview", shown: next })}
          onLabel="On"
          offLabel="Off"
          labelledBy={`pref-${ID}-name`}
          describedBy={`pref-${ID}-where`}
        />
      </PreferenceRow>
    </ul>
  );
}
