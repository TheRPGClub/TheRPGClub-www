import type { BirthDate } from "@/lib/birth-date";
import { SectionHeading } from "@/components/templates/page-header";
import { BirthDateEditor } from "@/components/settings/birth-date-editor";
import { SettingsReadFailed } from "@/components/settings/settings-read-failed";

// /settings: the member's Birth Date. Who sees it and the two-a-month limit
// in one line, then the field. Not tied to any Feature: the date belongs to
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
        Only you and staff see the full date. Other members see your birth year only on a Run that starts
        from it, and you&apos;re told before you start one. You can set or change it twice a month.
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
