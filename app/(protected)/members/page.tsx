import { Suspense } from "react";
import { parseShow } from "@/lib/members/members-wall";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { MembersSkeleton } from "@/components/member/wall/members-skeleton";
import { MembersWall } from "@/components/member/wall/members-wall";

// The club's contributor wall (components/member/wall): every current member
// with a club role, staff first. `?show=` narrows it to staff or regulars.

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const show = parseShow(firstParam((await searchParams).show));

  return (
    <Suspense fallback={<MembersSkeleton />}>
      <MembersWall show={show} />
    </Suspense>
  );
}
