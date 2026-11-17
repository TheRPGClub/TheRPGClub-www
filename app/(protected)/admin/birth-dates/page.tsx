import { clubToday } from "@/lib/birth-date";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection, TIER_SHORT } from "@/lib/staff";
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
        title="Birth Date"
        side={
          <>
            <b>For a member</b> · {TIER_SHORT[SECTION.tier]}
            <br />
            Not limited to two a month
          </>
        }
      />
      <p className="mt-3 max-w-[60ch] text-dim-foreground">{SECTION.blurb}</p>
      <BirthDateForMember today={clubToday()} />
    </div>
  );
}
