import { notFound } from "next/navigation";
import type { UserNowPlaying } from "@/lib/api/types";
import { loadMemberList, pageNumber } from "@/lib/members/member-page";
import { NowPlayingBooks } from "@/components/issue/member-now-playing";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { MemberListEmpty } from "@/components/member/member-game-card";
import { memberCounts } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
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
  const [{ id }, { page }] = await Promise.all([params, searchParams]);
  const currentPage = pageNumber(page);

  const data = await loadMemberList<UserNowPlaying>(id, "now_playing", PAGE_SIZE, currentPage);
  if (!data) notFound();
  const { user, list } = data;

  return (
    <MemberListTemplate
      userId={id}
      displayName={memberName(user)}
      title="Now playing"
      count={list.total}
      current="now_playing"
      counts={memberCounts(user)}
    >
      {list.entries.length === 0 ? (
        <MemberListEmpty>Nothing in progress.</MemberListEmpty>
      ) : (
        <NowPlayingBooks entries={list.entries} showSince />
      )}

      <ListPagination
        currentPage={currentPage}
        totalPages={list.totalPages}
        buildHref={(p) => `/members/${id}/now-playing-games${p > 1 ? `?page=${p}` : ""}`}
      />
    </MemberListTemplate>
  );
}
