import { listBotJobsAction } from "@/app/actions/bot-jobs";
import { listPresenceAction } from "@/app/actions/presence";
import { apiFetch } from "@/lib/api";
import type { ApiCollection, LiveEvent } from "@/lib/api/types";
import { upcomingCount } from "@/lib/live-events";
import { fetchSuggestions } from "@/lib/api/suggestions";
import { fetchVotingRound } from "@/lib/api/voting-round";
import { requireAuth } from "@/lib/session";
import { canUseTier, isAdminOrAbove, isSuperadmin, staffDeskFor, staffSection, staffTierOf, TIER_NAME } from "@/lib/staff";
import { deskNotes, deskReach, upcomingNote } from "@/lib/staff-desk";
import { DeskContents } from "@/components/admin/desk/desk-contents";
import { DeskHeader } from "@/components/templates/desk-header";
import { Wire } from "@/components/admin/desk/wire";
import { StaffOnly } from "@/components/staff-only";

// Upcoming live events among the newest few, for the desk's note; null when
// the list can't be read.
const LIVE_EVENT_LOOKBACK = 20;

async function upcomingLiveEvents(): Promise<string | null> {
  try {
    const res = await apiFetch(`/api/v1/live_events?page=1&per=${LIVE_EVENT_LOOKBACK}`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiCollection<LiveEvent>;
    return upcomingNote(upcomingCount(body.data), LIVE_EVENT_LOOKBACK);
  } catch {
    return null;
  }
}

// /admin, the production desk: a contents page of the tools the viewer's
// tier can use, grouped by area, beside the wire of bot jobs.
export default async function StaffDeskPage() {
  const session = await requireAuth();
  const m = session.membership;
  const overview = staffSection("overview");
  const tier = staffTierOf(m);
  if (!tier || !canUseTier(m, overview.tier)) {
    return <StaffOnly title={overview.label} tier={overview.tier} />;
  }

  const areas = staffDeskFor(m);
  const toolCount = areas.reduce((n, a) => n + a.sections.length, 0);

  const [wire, round, pending, presence, upcoming] = await Promise.all([
    listBotJobsAction(1),
    isAdminOrAbove(m) ? fetchVotingRound() : null,
    isSuperadmin(m) ? fetchSuggestions(["pending"], 1) : null,
    listPresenceAction(1, 1),
    upcomingLiveEvents(),
  ]);
  const jobs = wire.ok ? (wire.data ?? []) : [];
  const notes = deskNotes(
    areas,
    {
      round,
      pendingSuggestions: pending ? pending.total : null,
      nowPlaying: presence.ok ? (presence.data?.[0]?.activity_name ?? null) : null,
      presenceCount: presence.ok && presence.meta ? presence.meta.count : null,
      upcomingLiveEvents: upcoming,
      jobs,
    },
    new Date(),
  );
  const name = session.principal.global_name ?? session.principal.username;

  return (
    <div>
      <DeskHeader
        title={overview.label}
        side={
          <>
            <b>{name}</b> · {TIER_NAME[tier]}
            <br />
            {toolCount} {toolCount === 1 ? "tool" : "tools"}
            {deskReach(tier)}
          </>
        }
      />
      <div className="mt-6.5 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_27rem] xl:gap-11">
        <DeskContents areas={areas} notes={notes} />
        <Wire
          initialJobs={jobs}
          initialMeta={wire.meta ?? null}
          initialError={wire.ok ? null : wire.error}
          scope={isAdminOrAbove(m) ? "all" : "mine"}
        />
      </div>
    </div>
  );
}
