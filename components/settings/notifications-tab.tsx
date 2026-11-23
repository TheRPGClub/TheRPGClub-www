"use client";

import { saveChallengeDmsAction, type ChallengeDmsChange } from "@/app/actions/challenge-settings";
import type { ChallengeDmsData, ChallengeSettings } from "@/lib/challenge-settings";
import { SectionHeading } from "@/components/templates/page-header";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { PreferenceRow } from "@/components/feature/preference-row";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { SettingsReadFailed } from "@/components/settings/settings-read-failed";
import { useSwitchSaves } from "@/hooks/use-switch-saves";

const ROW = "challenge-dms";

// The Notifications tab: what the bot sends the member directly. Today that
// is the Challenge DM opt-out, one switch row in the page's own style that
// saves on flip (useSwitchSaves). It is there only while the Challenges
// Feature is shown to the member; staff seeing it in Preview get the badge.
// Otherwise one line says why there's nothing to choose.
export function NotificationsTab({
  challengeDms,
  challengesHidden,
}: {
  challengeDms: ChallengeDmsData | null;
  // The member hid Challenges themselves (Features tab), so they can bring
  // the DMs back; otherwise Challenges isn't theirs to use right now.
  challengesHidden: boolean;
}) {
  return (
    <section aria-labelledby="settings-dms" className="flex max-w-2xl flex-col">
      <SectionHeading title={<span id="settings-dms">Bot DMs</span>} />
      <p className="mt-3 max-w-[60ch] text-dim-foreground">
        What the bot sends you directly. Posts in the server&apos;s channels aren&apos;t affected.
      </p>
      {!challengeDms ? (
        <p className="mt-5 rounded-md border border-dashed border-border-strong px-4 py-5 text-sm text-dim-foreground">
          {challengesHidden
            ? "Show Challenges on the Features tab to choose its DMs."
            : "No DMs to choose right now."}
        </p>
      ) : challengeDms.settings ? (
        <DmsRow initial={challengeDms.settings} preview={challengeDms.preview} />
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
        where="The bot DMs you a week before a Season ends while you have a Run in it, and two days before Secret Santa picks close if you haven't picked. Off stops both. The DM saying the draw left you out still comes."
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
