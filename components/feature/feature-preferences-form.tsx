"use client";

import { savePreferenceAction } from "@/app/actions/feature-preferences";
import {
  applyPreferenceChange,
  whereItShows,
  type FeaturePreferences,
  type PreferenceChange,
} from "@/lib/feature-preferences";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { NewsCategoryChips } from "@/components/feature/news-category-chips";
import type { NewsCategoryPreferences } from "@/lib/news-category-preferences";
import { PreferenceRow } from "@/components/feature/preference-row";
import { HiddenPlatformsList, type HiddenPlatformsData } from "@/components/settings/hidden-platforms-list";
import { useSwitchSaves } from "@/hooks/use-switch-saves";

const NEWS_HUB = "news_hub";
const RELEASE_CALENDAR = "release_calendar";

function changeId(change: PreferenceChange): string {
  return change.kind === "feature" ? change.key : "show_preview";
}

// The Features tab: the member's Feature switches in two columns, each saving
// the moment it is flipped (see useSwitchSaves), then the settings that
// belong to a Feature side by side under them: the News Hub's News
// Categories and the Release Calendar's Hidden Platforms. Each is there only
// when the API lists its Feature (the member can use it), and goes
// unavailable while its Feature's switch, optimistic included, is Hidden.
export function FeaturePreferencesForm({
  initial,
  newsCategories,
  hiddenPlatforms = null,
}: {
  initial: FeaturePreferences;
  // The member's News Category Preferences; null when the read failed.
  newsCategories: NewsCategoryPreferences | null;
  // Null when the member can't use the Release Calendar.
  hiddenPlatforms?: HiddenPlatformsData | null;
}) {
  const { state: prefs, pending, errors, save } = useSwitchSaves({
    initial,
    apply: applyPreferenceChange,
    action: savePreferenceAction,
    idOf: changeId,
  });

  if (prefs.features.length === 0) {
    return (
      <p className="mt-5 rounded-md border border-dashed border-border-strong px-4 py-5 text-sm text-dim-foreground">
        Nothing to hide right now. Parts of the club you can hide will show up here once they&apos;re live.
      </p>
    );
  }

  const shown = (key: string) => prefs.features.some((f) => f.key === key && !f.hidden);
  const news = prefs.features.some((f) => f.key === NEWS_HUB);

  return (
    <>
      <ul data-slot="preference-list" className="mt-4 grid border-t border-border lg:grid-cols-2 lg:gap-x-10">
        {prefs.features.map((f) => (
          <PreferenceRow
            key={f.key}
            id={f.key}
            name={f.name}
            badge={f.preview ? <PreviewBadge /> : null}
            where={whereItShows(f.website)}
            dim={f.hidden}
            error={errors[f.key]}
          >
            <FeatureSwitch
              checked={!f.hidden}
              pending={pending.has(f.key)}
              onChange={(next) => save({ kind: "feature", key: f.key, shown: next })}
              onLabel="Shown"
              offLabel="Hidden"
              labelledBy={`pref-${f.key}-name`}
              describedBy={`pref-${f.key}-where`}
            />
          </PreferenceRow>
        ))}
      </ul>
      {(news || hiddenPlatforms) && (
        <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
          {news && <NewsCategoryChips initial={newsCategories} unavailable={!shown(NEWS_HUB)} />}
          {hiddenPlatforms && (
            <HiddenPlatformsList data={hiddenPlatforms} unavailable={!shown(RELEASE_CALENDAR)} />
          )}
        </div>
      )}
    </>
  );
}
