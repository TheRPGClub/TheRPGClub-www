import { loadGotyDesk } from "@/lib/goty/desk-load";
import { requireAuth } from "@/lib/session";
import { canUseTier, STAFF_DESK_BACK, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { GotyDesk } from "@/components/admin/goty/goty-desk";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("goty");

// /admin/goty, the GOTY Vote desk (www#194): the year's dates, a tie a
// runoff left, and its Game of the Year nominations, each removable with a
// reason the bot posts. Opens on the Current GOTY Vote (api#482, else
// the newest); `?year=` picks another.
export default async function GotyDeskPage({ searchParams }: { searchParams: Promise<{ year?: string | string[] }> }) {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const asked = (await searchParams).year;
  const desk = await loadGotyDesk(Array.isArray(asked) ? asked[0] : asked);

  if (desk.state !== "ready") {
    const down = desk.state === "unreachable";
    return (
      <div className="space-y-6">
        <DeskHeader back={STAFF_DESK_BACK} title={SECTION.label} side={<>{down ? "Server unreachable" : "No GOTY Vote yet"}</>} />
        <p
          role={down ? "alert" : undefined}
          className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground"
        >
          {down
            ? "Couldn't reach the club's server, so the GOTY Vote can't be read. Try again in a moment."
            : "No GOTY Vote to run yet. The club creates each year's on 1 January."}
        </p>
      </div>
    );
  }

  return (
    <GotyDesk
      vote={desk.vote}
      years={desk.years}
      nominations={desk.nominations}
      viewerId={session.principal.id}
      viewerName={session.principal.global_name ?? session.principal.username}
      now={desk.now}
    />
  );
}
