"use client";

import { saveChallengeDmsAction, type ChallengeDmsChange } from "@/app/actions/challenge-settings";
import type { ChallengeSettings } from "@/lib/challenge-settings";
import { SectionHeading } from "@/components/templates/page-header";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { PreferenceRow } from "@/components/feature/preference-row";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { SettingsReadFailed } from "@/components/settings/settings-read-failed";
import { useSwitchSaves } from "@/hooks/use-switch-saves";

const ROW = "challenge-dms";

// /settings: the Challenge DM opt-out, one switch row in the page's own
// style that saves on flip (useSwitchSaves). Shown only while the Challenges
// Feature is shown to the member; staff seeing it in Preview get the badge.
export function ChallengeDmsSection({
  settings,
  preview,
}: {
  // Null when the read failed.
  settings: ChallengeSettings | null;
  preview: boolean;
}) {
  return (
    <section aria-labelledby="settings-challenges" className="flex flex-col">
      <SectionHeading title={<span id="settings-challenges">Challenges</span>} />
      {settings ? (
        <DmsRow initial={settings} preview={preview} />
      ) : (
        <SettingsReadFailed>
          Couldn&apos;t load your Challenge settings from the club&apos;s server. Reload the page to try again.
        </SettingsReadFailed>
      )}
    </section>
  );
}

function DmsRow({ initial, preview }: { initial: ChallengeSettings; preview: boolean }) {
  const { state, pending, errors, save } = useSwitchSaves({
    initial,
    apply: (s: ChallengeSettings, change: ChallengeDmsChange) => ({ ...s, dms: change.dms }),
    action: saveChallengeDmsAction,
    idOf: () => ROW,
  });

  return (
    <ul className="mt-4 border-t border-border">
      <PreferenceRow
        id={ROW}
        name="Challenge DMs"
        badge={preview ? <PreviewBadge /> : null}
        where="The bot DMs you a week before a Season ends while you have a Run in it."
        dim={!state.dms}
        error={errors[ROW]}
      >
        <FeatureSwitch
          checked={state.dms}
          pending={pending.has(ROW)}
          onChange={(next) => save({ dms: next })}
          onLabel="On"
          offLabel="Off"
          labelledBy={`pref-${ROW}-name`}
          describedBy={`pref-${ROW}-where`}
        />
      </PreferenceRow>
    </ul>
  );
}
