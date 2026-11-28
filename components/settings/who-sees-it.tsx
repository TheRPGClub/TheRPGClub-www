import type { BirthdayShareSwitch } from "@/lib/birth-date";
import { birthDateAudience } from "@/lib/birth-date";
import { SectionHeading } from "@/components/templates/page-header";
import { ShareBirthdayRow } from "@/components/settings/share-birthday-row";

// "Who sees it", beside the member's Birth Date on the You tab: the "Share my
// Birthday" switch over a three-line ledger of who sees what (you and staff,
// members, a Run), which follows the switch as it moves.
export function WhoSeesIt(props: {
  state: BirthdayShareSwitch;
  pending: boolean;
  error: string | null;
  onChange: (next: boolean) => void;
}) {
  return (
    <section data-slot="settings-section" aria-labelledby="settings-who-sees">
      <SectionHeading title={<span id="settings-who-sees">Who sees it</span>} />
      <p className="mt-3 max-w-[60ch] text-dim-foreground">Sharing decides what other members see.</p>
      <div className="mt-4">
        <ShareBirthdayRow {...props} />
      </div>
      <dl>
        {birthDateAudience(props.state).map((row) => (
          <div
            key={row.who}
            className="grid gap-1 border-b border-border py-3 text-sm sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="font-label font-bold">{row.who}</dt>
            <dd className="text-dim-foreground">{row.sees}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
