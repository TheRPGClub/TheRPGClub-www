import { fetchWallMembers, wallView, type Show } from "@/lib/members/members-wall";
import { PageHeader } from "@/components/templates/page-header";
import { MemberTile } from "./member-tile";
import { ShowSwitch } from "./show-switch";

// The club's contributor wall: every current member with a club role as a
// square portrait, staff first and banded with their role. A switch narrows
// the wall to staff or regulars.

export async function MembersWall({ show }: { show: Show }) {
  const members = await fetchWallMembers();
  const all = members ?? [];
  const { counts, shown } = wallView(all, show);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        count={
          members
            ? `${all.length} ${all.length === 1 ? "member" : "members"}`
            : undefined
        }
      />

      {members && all.length > 0 && <ShowSwitch current={show} counts={counts} />}

      {!members ? (
        <WallNote>Couldn&apos;t load the members. Try again in a moment.</WallNote>
      ) : shown.length === 0 ? (
        <WallNote>
          {all.length === 0
            ? "No members found."
            : show === "staff"
              ? "No staff to show."
              : "No regulars to show."}
        </WallNote>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 xl:grid-cols-5">
          {shown.map((member) => (
            <li key={member.user.user_id}>
              <MemberTile member={member} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WallNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
      {children}
    </p>
  );
}
