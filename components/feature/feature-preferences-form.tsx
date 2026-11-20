"use client";

import { savePreferenceAction } from "@/app/actions/feature-preferences";
import {
  applyPreferenceChange,
  whereItShows,
  type FeaturePreferences,
  type PreferenceChange,
} from "@/lib/feature-preferences";
import { Badge } from "@/components/ui/badge";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { NewsCategorySwitches } from "@/components/feature/news-category-switches";
import type { NewsCategoryPreferences } from "@/lib/news-category-preferences";
import { PreferenceRow } from "@/components/feature/preference-row";
import { HiddenPlatformsList, type HiddenPlatformsData } from "@/components/settings/hidden-platforms-list";
import { useSwitchSaves } from "@/hooks/use-switch-saves";

const SHOW_PREVIEW = "show_preview";
const NEWS_HUB = "news_hub";
const RELEASE_CALENDAR = "release_calendar";

function changeId(change: PreferenceChange): string {
  return change.kind === "feature" ? change.key : SHOW_PREVIEW;
}

// The member's switches, each saving the moment it is flipped (see
// useSwitchSaves).
//
// The News Hub row carries its News Category switches nested under it. They
// render only when the API lists the News Hub (the member can use it), and
// go unavailable while the row's own switch, optimistic included, is Hidden.
// The Release Calendar row carries the member's Hidden Platforms the same way.
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

  const staff = prefs.show_preview_features !== null;

  return (
    <>
      {prefs.features.length > 0 ? (
        <ul className="mt-4 border-t border-border">
          {prefs.features.map((f) => {
            // Any key the API lists, including one www doesn't know yet.
            const key = f.key;
            const shown = !f.hidden;
            return (
              <PreferenceRow
                key={key}
                id={key}
                name={f.name}
                badge={f.preview ? <PreviewBadge /> : null}
                where={whereItShows(f.website)}
                dim={!shown}
                error={errors[key]}
                nested={
                  key === NEWS_HUB ? (
                    <NewsCategorySwitches initial={newsCategories} unavailable={!shown} />
                  ) : key === RELEASE_CALENDAR && hiddenPlatforms ? (
                    <HiddenPlatformsList data={hiddenPlatforms} unavailable={!shown} />
                  ) : null
                }
              >
                <FeatureSwitch
                  checked={shown}
                  pending={pending.has(key)}
                  onChange={(next) => save({ kind: "feature", key, shown: next })}
                  onLabel="Shown"
                  offLabel="Hidden"
                  labelledBy={`pref-${key}-name`}
                  describedBy={`pref-${key}-where`}
                />
              </PreferenceRow>
            );
          })}
        </ul>
      ) : (
        <p className="mt-5 rounded-md border border-dashed border-border-strong px-4 py-5 text-sm text-dim-foreground">
          Nothing to hide right now. Parts of the club you can hide will show up here once they&apos;re live.
        </p>
      )}

      {/* Staff only, so it sits apart from the member's own switches on a
          raised ink-2 panel rather than as one more row of the list. */}
      {staff && (
        <ul className="mt-8 rounded-md border border-border bg-card px-4" aria-label="Staff">
          <PreferenceRow
            id={SHOW_PREVIEW}
            name="Show Preview features"
            badge={<Badge className="border-0">Staff</Badge>}
            where="Preview Features in your sidebar, dashboard and pages. Turn it off to see the site as members do."
            dim={!prefs.show_preview_features}
            error={errors[SHOW_PREVIEW]}
            className="border-b-0"
          >
            <FeatureSwitch
              checked={prefs.show_preview_features === true}
              pending={pending.has(SHOW_PREVIEW)}
              onChange={(next) => save({ kind: "show_preview", shown: next })}
              onLabel="On"
              offLabel="Off"
              labelledBy={`pref-${SHOW_PREVIEW}-name`}
              describedBy={`pref-${SHOW_PREVIEW}-where`}
            />
          </PreferenceRow>
        </ul>
      )}
    </>
  );
}
