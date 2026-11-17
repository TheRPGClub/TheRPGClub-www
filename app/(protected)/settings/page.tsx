import { fetchNewsCategoryPreferences } from "@/lib/api/news";
import { fetchFeaturePreferences } from "@/lib/api/feature-preferences";
import { fetchBirthDate } from "@/lib/api/birth-date";
import { fetchChallengeSettings } from "@/lib/api/challenge-settings";
import { clubToday } from "@/lib/birth-date";
import { CHALLENGES_FEATURE, challengeDmsShown } from "@/lib/challenge-settings";
import { featureView } from "@/lib/features";
import { requireAuth } from "@/lib/session";
import { isModeratorOrAbove } from "@/lib/staff";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata = { title: "Settings" };

// /settings: open to every signed-in member and never flagged.
export default async function SettingsPage() {
  const session = await requireAuth();
  const userId = session.principal.discord_id;
  // The News Category Preferences only for a member who can open the News
  // Hub (the session says so); the form shows their block only then.
  const newsHub = featureView(session.features).canOpen("news_hub");
  // The Challenge DM switch only while Challenges is shown to them. The
  // Birth Date is the member's own, whatever the Challenges flag says.
  const challenges = challengeDmsShown(session.features);
  const [prefs, newsCategories, birthDate, challengeSettings] = await Promise.all([
    fetchFeaturePreferences(userId),
    newsHub ? fetchNewsCategoryPreferences(userId) : null,
    fetchBirthDate(userId),
    challenges ? fetchChallengeSettings(userId) : null,
  ]);
  const preview = session.features?.some((f) => f.key === CHALLENGES_FEATURE && f.preview) === true;

  return (
    <SettingsView
      prefs={prefs}
      newsCategories={newsCategories}
      birthDate={birthDate}
      staff={isModeratorOrAbove(session.membership)}
      today={clubToday()}
      challengeDms={challenges ? { settings: challengeSettings, preview } : null}
    />
  );
}
