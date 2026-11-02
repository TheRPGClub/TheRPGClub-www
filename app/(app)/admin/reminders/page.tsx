import { apiFetch } from "@/lib/api";
import type { ApiCollection, PublicReminder } from "@/lib/api/types";
import { fetchGuildChannels } from "@/lib/api/guild-channels";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { PageHeader } from "@/components/issue/page-header";
import { StaffOnly } from "@/components/staff-only";
import { PublicRemindersEditor } from "@/components/admin/public-reminders-editor";

const SECTION = staffSection("reminders");

// Upcoming reminders, soonest first, as the bot's /publicreminder list shows
// them. Null when the list can't be read.
async function fetchUpcomingReminders(): Promise<PublicReminder[] | null> {
  try {
    const res = await apiFetch(
      "/api/v1/public_reminders?enabled=true&per=200",
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as ApiCollection<PublicReminder>;
    return body.data;
  } catch {
    return null;
  }
}

export default async function PublicRemindersPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const [reminders, channels] = await Promise.all([
    fetchUpcomingReminders(),
    fetchGuildChannels(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={SECTION.label} description={SECTION.blurb} />
      {reminders === null ? (
        <p role="alert" className="text-destructive">
          {"Couldn't load the reminders. Refresh to try again."}
        </p>
      ) : (
        <PublicRemindersEditor reminders={reminders} channels={channels} />
      )}
    </div>
  );
}
