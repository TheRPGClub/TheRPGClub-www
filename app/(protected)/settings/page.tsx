import { apiFetch } from "@/lib/api";
import { fetchNewsCategoryPreferences } from "@/lib/api/news";
import { featureView } from "@/lib/features";
import { requireAuth } from "@/lib/session";
import type { FeaturePreferences } from "@/lib/feature-preferences";
import { PageHeader, SectionHeading } from "@/components/templates/page-header";
import { FeaturePreferencesForm } from "@/components/feature/feature-preferences-form";

export const metadata = { title: "Settings" };

// The member's own preferences, read fresh: a flip elsewhere (another tab, a
// flag change) shows on the next load.
async function fetchPreferences(userId: string): Promise<FeaturePreferences | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/feature_preferences`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: FeaturePreferences };
    return body.data ?? null;
  } catch {
    return null;
  }
}

// /settings: what this member sees on the website. Open to every signed-in
// member and never flagged; the switches only shape the member's own view
// (nav, dashboard, sections), never what they may open from a link.
export default async function SettingsPage() {
  const session = await requireAuth();
  const userId = session.principal.discord_id;
  // The News Category Preferences only for a member who can open the News
  // Hub (the session says so); the form shows their block only then.
  const newsHub = featureView(session.features).canOpen("news_hub");
  const [prefs, newsCategories] = await Promise.all([
    fetchPreferences(userId),
    newsHub ? fetchNewsCategoryPreferences(userId) : null,
  ]);

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
