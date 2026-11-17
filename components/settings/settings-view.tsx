import type { BirthDate } from "@/lib/birth-date";
import type { ChallengeSettings } from "@/lib/challenge-settings";
import type { FeaturePreferences } from "@/lib/feature-preferences";
import type { NewsCategoryPreferences } from "@/lib/news-category-preferences";
import { PageHeader, SectionHeading } from "@/components/templates/page-header";
import { FeaturePreferencesForm } from "@/components/feature/feature-preferences-form";
import { BirthDateSection } from "@/components/settings/birth-date-section";
import { ChallengeDmsSection } from "@/components/settings/challenge-dms-section";
import { SettingsReadFailed } from "@/components/settings/settings-read-failed";

// The Challenge DM switch's data: null when the Challenges Feature isn't
// shown to this member, so the section is left out.
export interface ChallengeDmsData {
  // Null when the read failed.
  settings: ChallengeSettings | null;
  // Staff see Challenges only because it is in Preview.
  preview: boolean;
}

// /settings: what this member sees on the website, their Birth Date, and
// (while Challenges is shown to them) their Challenge DMs. The Feature
// switches only shape the member's own view (nav, dashboard, sections),
// never what they may open from a link.
export function SettingsView({
  prefs,
  newsCategories,
  birthDate,
  staff,
  today,
  challengeDms,
}: {
  // Null when the preferences couldn't be read.
  prefs: FeaturePreferences | null;
  // Null for a member who can't open the News Hub, or when the read failed.
  newsCategories: NewsCategoryPreferences | null;
  // Null when the Birth Date couldn't be read.
  birthDate: BirthDate | null;
  // Moderator or above: Birth Date changes aren't limited.
  staff: boolean;
  // The club's date (YYYY-MM-DD), the latest Birth Date the field takes.
  today: string;
  challengeDms: ChallengeDmsData | null;
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-10">
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
          <SettingsReadFailed>
            Couldn&apos;t load your settings from the club&apos;s server. Reload the page to try again.
          </SettingsReadFailed>
        )}
      </section>

      {challengeDms && <ChallengeDmsSection settings={challengeDms.settings} preview={challengeDms.preview} />}

      <BirthDateSection birthDate={birthDate} staff={staff} today={today} />
    </div>
  );
}
