import Link from "next/link";
import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ApiCollection, LiveEvent } from "@/lib/api/types";
import { discordLinkConfig } from "@/lib/gotm-links";
import { upcomingCount } from "@/lib/live-events";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/admin/desk/desk-header";
import { YourZone } from "@/components/admin/desk/your-zone";
import { LiveEventList } from "@/components/admin/live-events/live-event-list";
import { StaffOnly } from "@/components/staff-only";
import { buttonVariants } from "@/components/ui/button";

const SECTION = staffSection("live-events");

// The newest live events. Null when the list can't be read.
async function fetchLiveEvents(): Promise<ApiCollection<LiveEvent> | null> {
  try {
    const res = await apiFetch("/api/v1/live_events?page=1&per=50", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ApiCollection<LiveEvent>;
  } catch {
    return null;
  }
}

export default async function LiveEventsPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const list = await fetchLiveEvents();
  const events = list?.data ?? [];
  const upcoming = upcomingCount(events);

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          <>
            {list ? (
              <>
                <b>{upcoming} upcoming</b> · {list.meta.count} in all
              </>
            ) : (
              "Forum thread + Discord event"
            )}
            <br />
            Your zone <YourZone />
          </>
        }
      />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/live-events/new" className={buttonVariants({ variant: "highlight" })}>
          <Plus data-icon="inline-start" />
          New live event
        </Link>
        <p className="text-sm text-paper-dim">{SECTION.blurb}</p>
      </div>
      <div className="mt-6">
        {list === null ? (
          <p role="alert" className="text-destructive">
            {"Couldn't load the live events. Refresh to try again."}
          </p>
        ) : (
          <LiveEventList events={events} guildId={discordLinkConfig().guildId} />
        )}
      </div>
    </div>
  );
}
