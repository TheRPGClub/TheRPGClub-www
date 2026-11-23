import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ApiCollection, ApiSingle, Review, User } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { ListPagination } from "@/components/list-pagination";
import { MemberReviewList } from "@/components/member/member-review-list";
import { memberCounts } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { fetchOwnDrafts } from "@/lib/reviews/drafts-read";
import { MemberDrafts } from "@/components/reviews/drafts/member-drafts";

const PAGE_SIZE = 10;
const DRAFTS_SHOWN = 6;

export default async function MemberReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  const sessionRead = getSession();
  const [userRes, session, listRes, drafts] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    sessionRead,
    apiFetch(
      `/api/v1/users/${id}/reviews?per=${PAGE_SIZE}&page=${currentPage}`,
      {
        cache: "no-store",
      },
    ),
    // Your own Drafts sit above your Published reviews, on the first page
    // only. Nobody else's are ever read.
    sessionRead.then((s) =>
      s?.principal.discord_id === id && currentPage === 1
        ? fetchOwnDrafts(id, { per: DRAFTS_SHOWN })
        : null,
    ),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const isSelf = session?.principal.discord_id === id;
  const displayName = memberName(user);

  let reviews: Review[] = [];
  let total = 0;
  let totalPages = 1;
  if (listRes.ok) {
    const body: ApiCollection<Review> = await listRes.json();
    reviews = body.data;
    // The server owns the split; PAGE_SIZE is only what we asked for.
    const pagination = paginationOf(body.meta, reviews.length);
    total = pagination.total;
    totalPages = pagination.totalPages;
  }
  const href = (p: number) =>
    `/members/${id}/reviews${p > 1 ? `?page=${p}` : ""}`;

  return (
    <MemberListTemplate
      userId={id}
      displayName={displayName}
      title="Reviews"
      count={total}
      countNoun={["review", "reviews"]}
      current="reviews"
      counts={memberCounts(user)}
    >
      <MemberDrafts read={drafts} publishedCount={total}>
        <MemberReviewList
          reviews={reviews}
          hideUser={isSelf}
          emptyMessage={
            isSelf ? "You haven't written any reviews yet." : "No reviews yet."
          }
        />
      </MemberDrafts>

      <ListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={href}
      />
    </MemberListTemplate>
  );
}
