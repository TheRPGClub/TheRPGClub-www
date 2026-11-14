import type { FeaturePreferences } from "@/lib/feature-preferences";
import type { NewsCategoryPreferences } from "@/lib/news-category-preferences";
import { PageHeader, SectionHeading } from "@/components/templates/page-header";
import { FeaturePreferencesForm } from "@/components/feature/feature-preferences-form";

// /settings: what this member sees on the website. The switches only shape
// the member's own view (nav, dashboard, sections), never what they may open
// from a link.
export function SettingsView({
  prefs,
  newsCategories,
}: {
  // Null when the preferences couldn't be read.
  prefs: FeaturePreferences | null;
  // Null for a member who can't open the News Hub, or when the read failed.
  newsCategories: NewsCategoryPreferences | null;
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <PageHeader title="Settings" />

      <section aria-labelledby="settings-features" className="flex flex-col">
        <SectionHeading title={<span id="settings-features">Features</span>} />
        <p className="mt-3 max-w-[60ch] text-dim-foreground">
          Hide parts of the club you don&apos;t use. They leave your sidebar, your dashboard and other
          pages. Direct links still work.
        </p>
        {prefs ? (
          <FeaturePreferencesForm initial={prefs} newsCategories={newsCategories} />
        ) : (
          <p
            role="alert"
            className="mt-5 rounded-md border border-dashed border-border-strong px-4 py-5 text-sm text-dim-foreground"
          >
            Couldn&apos;t load your settings from the club&apos;s server. Reload the page to try again.
          </p>
        )}
      </section>
    </div>
  );
}
