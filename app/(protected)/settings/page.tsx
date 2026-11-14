import { fetchNewsCategoryPreferences } from "@/lib/api/news";
import { fetchFeaturePreferences } from "@/lib/api/feature-preferences";
import { featureView } from "@/lib/features";
import { requireAuth } from "@/lib/session";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata = { title: "Settings" };

// /settings: open to every signed-in member and never flagged.
export default async function SettingsPage() {
  const session = await requireAuth();
  const userId = session.principal.discord_id;
  // The News Category Preferences only for a member who can open the News
  // Hub (the session says so); the form shows their block only then.
  const newsHub = featureView(session.features).canOpen("news_hub");
  const [prefs, newsCategories] = await Promise.all([
    fetchFeaturePreferences(userId),
    newsHub ? fetchNewsCategoryPreferences(userId) : null,
  ]);

  return <SettingsView prefs={prefs} newsCategories={newsCategories} />;
}
