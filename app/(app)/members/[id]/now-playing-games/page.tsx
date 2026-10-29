import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  User,
  UserNowPlaying,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { NowPlayingBooks } from "@/components/issue/member-now-playing";
import { MemberListShell } from "@/components/member/member-list-shell";
import { MemberListEmpty } from "@/components/member/member-game-card";
import { memberCounts, memberName } from "@/components/member/member-lists";
import { ListPagination } from "@/components/list-pagination";

const PAGE_SIZE = 24;

// Now Playing in full: every game on the desk face-on, with the member's note
// and when they picked it up.
export default async function NowPlayingGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  const [userRes, listRes] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    apiFetch(
      `/api/v1/users/${id}/now_playing?per=${PAGE_SIZE}&page=${currentPage}`,
      { cache: "no-store" },
    ),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = memberName(user);

  let entries: UserNowPlaying[] = [];
  let total = 0;
  let totalPages = 1;
  if (listRes.ok) {
    const body: ApiCollection<UserNowPlaying> = await listRes.json();
    entries = body.data;
    // The server owns the split; PAGE_SIZE is only what we asked for.
    const pagination = paginationOf(body.meta, entries.length);
    total = pagination.total;
    totalPages = pagination.totalPages;
  }
  const href = (p: number) =>
    `/members/${id}/now-playing-games${p > 1 ? `?page=${p}` : ""}`;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Now playing"
      count={total}
      current="now_playing"
      counts={memberCounts(user)}
    >
      {entries.length === 0 ? (
        <MemberListEmpty>Nothing in progress.</MemberListEmpty>
      ) : (
        <NowPlayingBooks entries={entries} showSince />
      )}

      <ListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={href}
      />
    </MemberListShell>
  );
}
