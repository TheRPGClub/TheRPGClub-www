import { fetchWallTiers } from "@/lib/members/members-wall";
import { PageHeader } from "@/components/templates/page-header";
import { MemberTiers } from "./member-tiers";
import { WallNote } from "./wall-note";

// The club's members page: every current member with a club role, in tiers
// by their highest role (Admins down to Newcomers), with a search over them.

export async function MembersWall() {
  const tiers = await fetchWallTiers();
  const total = tiers?.reduce((n, t) => n + t.members.length, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        count={tiers ? `${total} ${total === 1 ? "member" : "members"}` : undefined}
      />
      {!tiers ? (
        <WallNote>Couldn&apos;t load the members. Try again in a moment.</WallNote>
      ) : total === 0 ? (
        <WallNote>No members found.</WallNote>
      ) : (
        <MemberTiers tiers={tiers} />
      )}
    </div>
  );
}
