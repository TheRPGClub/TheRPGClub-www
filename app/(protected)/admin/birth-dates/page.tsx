import { clubToday } from "@/lib/challenges/dates";
import { requireAuth } from "@/lib/session";
import { canUseTier, STAFF_DESK_BACK, staffSection, TIER_SHORT } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { BirthDateForMember } from "@/components/admin/birth-dates/birth-date-for-member";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("birth-dates");

// /admin/birth-dates: a Moderator or above sets or removes another member's
// Birth Date, as the bot's /profile birth-date member: does. Not tied to
// the Challenges Feature: the date belongs to the member.
export default async function BirthDatesPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  return (
    <div>
      <DeskHeader
        back={STAFF_DESK_BACK}
        title="Birth Date"
        side={
          <>
            <b>For a member</b> · {TIER_SHORT[SECTION.tier]}
            <br />
            Not limited to two a month
          </>
        }
      />
      <div data-slot="desk-body">
        <p className="mt-3 max-w-[60ch] text-dim-foreground">{SECTION.blurb}</p>
        <BirthDateForMember today={clubToday()} />
      </div>
    </div>
  );
}
