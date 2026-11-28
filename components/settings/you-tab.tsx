import type { BirthDate } from "@/lib/birth-date";
import { SectionHeading } from "@/components/templates/page-header";
import { BirthDateEditor } from "@/components/settings/birth-date-editor";
import { SettingsReadFailed } from "@/components/settings/settings-read-failed";

// The You tab: the member's Birth Date (Day, Month and an optional Year) and,
// beside it, who sees it, led by the "Share my Birthday" switch (design pick
// A). Not tied to any Feature: the date belongs to the member, whatever the
// Challenges flag says.
export function YouTab({
  birthDate,
  staff,
  today,
}: {
  // Null when the read failed.
  birthDate: BirthDate | null;
  staff: boolean;
  today: string;
}) {
  const lead = (
    <>
      <SectionHeading title={<span id="settings-birth-date">Birth Date</span>} />
      <p className="mt-3 max-w-[60ch] text-dim-foreground">
        The year is optional; it&apos;s only used by Challenges that start at your birth year. You can set or
        change the date twice a month.
      </p>
    </>
  );

  if (!birthDate) {
    return (
      <section data-slot="settings-section" aria-labelledby="settings-birth-date" className="max-w-2xl">
        {lead}
        <SettingsReadFailed>
          Couldn&apos;t load your Birth Date from the club&apos;s server. Reload the page to try again.
        </SettingsReadFailed>
      </section>
    );
  }
  return <BirthDateEditor initial={birthDate} staff={staff} today={today} lead={lead} />;
}
