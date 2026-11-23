import { listBotJobsAction } from "@/app/actions/bot-jobs";
import { listPresenceAction } from "@/app/actions/presence";
import { fetchRecentLiveEvents } from "@/lib/api/live-events";
import { fetchSuggestions } from "@/lib/api/suggestions";
import { fetchVotingRound } from "@/lib/api/voting-round";
import { deskTabsFor, parseDeskTab, parseJobsShow } from "@/lib/desk-tabs";
import { trayCards } from "@/lib/desk-tray";
import { upcomingCount } from "@/lib/live-events";
import { requireAuth } from "@/lib/session";
import { canUseTier, isAdminOrAbove, isSuperadmin, staffDeskFor, staffSection } from "@/lib/staff";
import { deskNotes, upcomingNote } from "@/lib/staff-desk";
import { StaffDesk } from "@/components/admin/desk/staff-desk";
import { StaffOnly } from "@/components/staff-only";

export const metadata = { title: "Staff desk" };

// Live events read for the in-tray and the Live events note.
const LIVE_EVENT_LOOKBACK = 20;

// /admin, the Staff desk: what's waiting on staff, the tools the viewer's
// tier can use by job, and the bot's jobs. `?tab=` opens a tab, and
// `?tab=jobs&show=failed` Bot jobs on a filter.
export default async function StaffDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[]; show?: string | string[] }>;
}) {
  const session = await requireAuth();
  const m = session.membership;
  const overview = staffSection("overview");
  if (!canUseTier(m, overview.tier)) {
    return <StaffOnly title={overview.label} tier={overview.tier} />;
  }

  const groups = staffDeskFor(m);
  const tabs = deskTabsFor(groups);
  const params = await searchParams;
  const [wire, round, pending, presence, events] = await Promise.all([
    listBotJobsAction(1),
    isAdminOrAbove(m) ? fetchVotingRound() : null,
    isSuperadmin(m) ? fetchSuggestions(["pending"]) : null,
    listPresenceAction(1, 1),
    fetchRecentLiveEvents(LIVE_EVENT_LOOKBACK),
  ]);
  const jobs = wire.ok ? (wire.data ?? []) : [];
  const now = new Date();
  const readings = {
    round,
    pendingSuggestions: pending ? pending.total : null,
    nowPlaying: presence.ok ? (presence.data?.[0]?.activity_name ?? null) : null,
    presenceCount: presence.ok && presence.meta ? presence.meta.count : null,
    upcomingLiveEvents: events ? upcomingNote(upcomingCount(events, now.getTime()), LIVE_EVENT_LOOKBACK) : null,
    jobs,
  };

  return (
    <StaffDesk
      groups={groups}
      notes={deskNotes(groups.flatMap((g) => g.sections), readings, now)}
      cards={trayCards(
        { round, pending: pending && { total: pending.total, createdAt: pending.rows.map((r) => r.created_at) }, jobs, events },
        now,
      )}
      jobs={jobs}
      jobsMeta={wire.meta ?? null}
      jobsError={wire.ok ? null : (wire.error ?? null)}
      scope={isAdminOrAbove(m) ? "all" : "mine"}
      pendingSuggestions={readings.pendingSuggestions}
      tab={parseDeskTab(params.tab, tabs)}
      show={parseJobsShow(params.show)}
      now={now}
    />
  );
}
