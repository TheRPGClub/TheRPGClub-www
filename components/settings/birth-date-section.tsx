import type { BirthDate } from "@/lib/birth-date";
import { SectionHeading } from "@/components/templates/page-header";
import { BirthDateEditor } from "@/components/settings/birth-date-editor";
import { SettingsReadFailed } from "@/components/settings/settings-read-failed";

// /settings: the member's Birth Date. Who sees it and the two-a-month limit
// in one line, then Day, Month and an optional Year, and the "Share my
// Birthday" switch (design pick A). Not tied to any Feature: the date belongs to
// the member, whatever the Challenges flag says.
export function BirthDateSection({
  birthDate,
  staff,
  today,
}: {
  // Null when the read failed.
  birthDate: BirthDate | null;
  staff: boolean;
  today: string;
}) {
  return (
    <section aria-labelledby="settings-birth-date" className="flex flex-col">
      <SectionHeading title={<span id="settings-birth-date">Birth Date</span>} />
      <p className="mt-3 max-w-[60ch] text-dim-foreground">
        Only you and staff see your full Birth Date. The year is optional; it&apos;s only used by Challenges
        that start at your birth year. You can set or change the date twice a month.
      </p>
      {birthDate ? (
        <div className="mt-5">
          <BirthDateEditor initial={birthDate} staff={staff} today={today} />
        </div>
      ) : (
        <SettingsReadFailed>
          Couldn&apos;t load your Birth Date from the club&apos;s server. Reload the page to try again.
        </SettingsReadFailed>
      )}
    </section>
  );
}
