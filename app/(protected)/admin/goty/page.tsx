import { fetchGotyNominations, fetchGotyVote, fetchGotyVotes } from "@/lib/api/goty";
import { pickGotyYear } from "@/lib/goty-desk";
import { requireAuth } from "@/lib/session";
import { canUseTier, STAFF_DESK_BACK, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { GotyDesk } from "@/components/admin/goty/goty-desk";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("goty");

// The year's vote and nominations, stamped with the moment they were read
// so the windows and the status line agree.
async function loadDesk(year: number | null) {
  if (!year) return { vote: null, nominations: [], now: Date.now() };
  const [vote, nominations] = await Promise.all([fetchGotyVote(year), fetchGotyNominations(year)]);
  return { vote, nominations, now: Date.now() };
}

// /admin/goty, the GOTY Vote desk (www#194): the year's dates, a tie a
// runoff left, and its Game of the Year nominations, each removable with a
// reason the bot posts. Opens on the GOTY Vote still running (else the
// newest); `?year=` picks another.
export default async function GotyDeskPage({ searchParams }: { searchParams: Promise<{ year?: string | string[] }> }) {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const asked = (await searchParams).year;
  const votes = await fetchGotyVotes();
  const year = pickGotyYear(votes, Array.isArray(asked) ? asked[0] : asked);
  const { vote, nominations, now } = await loadDesk(year);

  if (!vote) {
    return (
      <div className="space-y-6">
        <DeskHeader back={STAFF_DESK_BACK} title={SECTION.label} side={<>No GOTY Vote yet</>} />
        <p className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
          No GOTY Vote to run yet. The club creates each year&apos;s by December 1.
        </p>
      </div>
    );
  }

  return (
    <GotyDesk
      vote={vote}
      years={votes.map((v) => v.year).sort((a, b) => b - a)}
      nominations={nominations}
      viewerId={session.principal.id}
      viewerName={session.principal.global_name ?? session.principal.username}
      now={now}
    />
  );
}
