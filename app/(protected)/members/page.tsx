import { Suspense } from "react";
import { MembersSkeleton } from "@/components/member/wall/members-skeleton";
import { MembersWall } from "@/components/member/wall/members-wall";

// The club's members page (components/member/wall): every current member with
// a club role, in tiers by their highest role.

export default function MembersPage() {
  return (
    <Suspense fallback={<MembersSkeleton />}>
      <MembersWall />
    </Suspense>
  );
}
