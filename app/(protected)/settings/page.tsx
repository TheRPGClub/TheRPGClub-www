import { fetchNewsCategoryPreferences } from "@/lib/api/news";
import { fetchFeaturePreferences } from "@/lib/api/feature-preferences";
import { fetchBirthDate } from "@/lib/api/birth-date";
import { fetchHiddenPlatforms, fetchPlatformChoices } from "@/lib/api/hidden-platforms";
import { fetchChallengeSettings } from "@/lib/api/challenge-settings";
import { fetchDashboardPanels } from "@/lib/api/dashboard-panels";
import { clubToday } from "@/lib/challenges/dates";
import { CHALLENGES_FEATURE, challengeDmsShown } from "@/lib/challenge-settings";
import { featureView } from "@/lib/features";
import { requireAuth } from "@/lib/session";
import { isModeratorOrAbove, staffSectionsFor } from "@/lib/staff";
import { parseSettingsTab } from "@/lib/settings-tabs";
import { themeCards } from "@/lib/theme-picker";
import { clubDefaultNames, pinRules, pinsCustomised } from "@/lib/pinned-pages";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata = { title: "Settings" };

// The desk tools the Staff tab links: those that set what /settings can't.
const DESK_LINKS = new Set(["features", "birth-dates"]);

// /settings: open to every signed-in member and never flagged. `?tab=` picks
// the open tab (Features without one).
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const session = await requireAuth();
  const staff = isModeratorOrAbove(session.membership);
  const tab = parseSettingsTab((await searchParams).tab, staff);
  const userId = session.principal.discord_id;
  // The News Category Preferences only for a member who can open the News
  // Hub (the session says so); the form shows their block only then.
  const newsHub = featureView(session.features).canOpen("news_hub");
  // The Challenge DM switch only while Challenges is shown to them. The
  // Birth Date is the member's own, whatever the Challenges flag says.
  const challenges = challengeDmsShown(session.features);
  // Hidden Platforms belong to the Release Calendar: its API 404s for a
  // member who can't use it, and the list is left out then.
  const releaseCalendar = featureView(session.features).canOpen("release_calendar");
  const [prefs, newsCategories, birthDate, challengeSettings, hiddenRead, platformChoices, panels] =
    await Promise.all([
      fetchFeaturePreferences(userId),
      newsHub ? fetchNewsCategoryPreferences(userId) : null,
      fetchBirthDate(userId),
      challenges ? fetchChallengeSettings(userId) : null,
      releaseCalendar ? fetchHiddenPlatforms(userId) : ("not_found" as const),
      releaseCalendar ? fetchPlatformChoices() : [],
      // Only `customised` is read here: the Reset dashboard row shows on it.
      fetchDashboardPanels(userId),
    ]);
  const preview = session.features?.some((f) => f.key === CHALLENGES_FEATURE && f.preview) === true;

  return (
    <SettingsView
      tab={tab}
      prefs={prefs}
      pinsCustomised={pinsCustomised(session)}
      pinsDefault={clubDefaultNames(pinRules(session).clubDefault)}
      panelsCustomised={panels?.customised === true}
      themes={themeCards(session.themes)}
      newsCategories={newsCategories}
      hiddenPlatforms={hiddenRead === "not_found" ? null : { hidden: hiddenRead, choices: platformChoices }}
      birthDate={birthDate}
      staff={staff}
      desk={staffSectionsFor(session.membership).filter((s) => DESK_LINKS.has(s.key))}
      today={clubToday()}
      challengeDms={challenges ? { settings: challengeSettings, preview } : null}
    />
  );
}
