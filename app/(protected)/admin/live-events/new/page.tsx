import { requireAuth } from "@/lib/session";
import { discordLinkConfig } from "@/lib/gotm-links";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { YourZone } from "@/components/admin/desk/your-zone";
import { LiveEventForm } from "@/components/admin/live-events/live-event-form";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("live-events");

// A new live event (mock admin-c-4): the form beside its poster proof.
export default async function NewLiveEventPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title="Live event" tier={SECTION.tier} />;
  }

  return (
    <div>
      <DeskHeader
        title="Live event"
        side={
          <>
            Forum thread + Discord event
            <br />
            Your zone <YourZone />
          </>
        }
      />
      <LiveEventForm guildId={discordLinkConfig().guildId} />
    </div>
  );
}
