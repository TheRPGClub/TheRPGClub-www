import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  Review,
  User,
} from "@/lib/api/types";
import { MemberListShell } from "@/components/member/member-list-shell";
import { MemberListPagination } from "@/components/member/member-list-pagination";
import { MemberReviewList } from "@/components/member/member-review-list";

const PAGE_SIZE = 10;

export default async function MemberReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [userRes, session, listRes] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    getSession(),
    apiFetch(`/api/v1/users/${id}/reviews?limit=${PAGE_SIZE}&offset=${offset}`, {
      cache: "no-store",
    }),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const isSelf = session?.principal.discord_id === id;
  const displayName = user.global_name ?? user.username ?? id;

  let reviews: Review[] = [];
  let total = 0;
  if (listRes.ok) {
    const body: ApiCollection<Review> = await listRes.json();
    reviews = body.data;
    total = body.meta.total ?? reviews.length;
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) =>
    `/members/${id}/reviews${p > 1 ? `?page=${p}` : ""}`;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Reviews"
      count={total}
    >
      <MemberReviewList
        reviews={reviews}
        hideUser={isSelf}
        emptyMessage={
          isSelf ? "You haven't written any reviews yet." : "No reviews yet."
        }
      />

      <MemberListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={href}
      />
    </MemberListShell>
  );
}
