import { memberGroups, rankMeter, type RankedMember } from "@/lib/franchises/progress";
import type { FranchiseProgressMember } from "@/lib/franchises/types";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/templates/page-header";
import { MEMBER_GRID, MemberRow } from "@/components/franchises/progress/progress-member-row";

// The Members table (pick 1E): everyone who has played the Franchise,
// Conquered first in the order they Conquered (with the stamp), then the
// rest by Mainline (by Mainline + spin-offs while it has no Mainline
// games). Pressing a row swaps the dials and the wall to that member's; the
// viewer's row is marked, the pressed one ringed. On phones a row drops to
// name, bar and Playtime.
export function ProgressMembers({
  franchiseId,
  members,
  viewerId,
  selectedId,
}: {
  franchiseId: number;
  members: FranchiseProgressMember[];
  viewerId: string;
  // The member whose progress is showing, when not the viewer's.
  selectedId: string | null;
}) {
  const noMainline = members.length > 0 && rankMeter(members[0].meters) === "all";
  const { conquered, going } = memberGroups(members);
  const played = `${members.length} ${members.length === 1 ? "has" : "have"} played it`;
  const row = (r: RankedMember) => (
    <MemberRow
      key={r.member.user.user_id}
      ranked={r}
      franchiseId={franchiseId}
      you={r.member.user.user_id === viewerId}
      selected={r.member.user.user_id === selectedId}
    />
  );

  return (
    <section aria-label="Members" className="mt-10">
      <SectionHeading
        title="Members"
        count={
          members.length === 0
            ? "Nobody has played it yet"
            : noMainline
              ? `${played} · ranked by Mainline + spin-offs until a Regular marks Mainline games`
              : `${played} · press one to see their dials`
        }
      />
      {members.length > 0 && (
        <>
          <div
            aria-hidden
            className={cn(
              MEMBER_GRID,
              "font-label mt-3 hidden border-b-2 border-foreground pb-2 text-[0.74rem] leading-none font-bold tracking-[0.08em] text-faint-foreground lg:grid",
            )}
          >
            <span />
            <span>Member</span>
            <span />
            <span>{noMainline ? "Mainline + spin-offs" : "Mainline"}</span>
            <span className="text-right">Everything</span>
            <span className="text-right">Spin-offs</span>
            <span className="text-right">Playtime</span>
          </div>
          {conquered.length > 0 && (
            <>
              <GroupHead title={`Conquered by ${conquered.length}`} note="in order" />
              <ol>{conquered.map(row)}</ol>
            </>
          )}
          {going.length > 0 && (
            <>
              {conquered.length > 0 && <GroupHead title="Still going" note={noMainline ? "by Mainline + spin-offs" : "by Mainline"} />}
              <ol start={conquered.length + 1}>{going.map(row)}</ol>
            </>
          )}
        </>
      )}
    </section>
  );
}

function GroupHead({ title, note }: { title: string; note: string }) {
  return (
    <p className="font-label flex items-baseline gap-2 pt-3.5 pb-1.5 text-[0.76rem] leading-none font-bold tracking-[0.08em] text-faint-foreground">
      <b className="font-headline text-[1.15rem] font-normal tracking-normal text-foreground">{title}</b>
      {note}
    </p>
  );
}
