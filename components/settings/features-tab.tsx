import type { FeaturePreferences } from "@/lib/feature-preferences";
import type { NewsCategoryPreferences } from "@/lib/news-category-preferences";
import { FeaturePreferencesForm } from "@/components/feature/feature-preferences-form";
import { SettingsReadFailed } from "@/components/settings/settings-read-failed";
import type { HiddenPlatformsData } from "@/components/settings/hidden-platforms-list";

// The Features tab: one line on what hiding does, then the member's switches
// and the settings that belong to a Feature (FeaturePreferencesForm).
export function FeaturesTab({
  prefs,
  newsCategories,
  hiddenPlatforms,
}: {
  prefs: FeaturePreferences | null;
  newsCategories: NewsCategoryPreferences | null;
  hiddenPlatforms: HiddenPlatformsData | null;
}) {
  return (
    <section aria-label="Features">
      <p className="max-w-[60ch] text-dim-foreground">
        Hide parts of the club you don&apos;t use. They leave your sidebar, your dashboard and other pages.
        Direct links still work.
      </p>
      {prefs ? (
        <FeaturePreferencesForm initial={prefs} newsCategories={newsCategories} hiddenPlatforms={hiddenPlatforms} />
      ) : (
        <SettingsReadFailed>
          Couldn&apos;t load your settings from the club&apos;s server. Reload the page to try again.
        </SettingsReadFailed>
      )}
    </section>
  );
}
