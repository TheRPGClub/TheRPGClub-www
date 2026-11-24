import { notFound } from "next/navigation";
import type { UserNowPlaying } from "@/lib/api/types";
import { loadMemberList, pageNumber } from "@/lib/members/member-page";
import { NowPlayingBooks } from "@/components/issue/member-now-playing";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { MemberListEmpty } from "@/components/member/member-game-card";
import { memberCounts } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { ListPagination } from "@/components/list-pagination";
import { loadShelfOwner } from "@/lib/members/shelf-manage";
import { ShelfManageProvider } from "@/components/member/manage/shelf-manage-context";
import { ShelfAddButton } from "@/components/member/manage/shelf-add-button";
import { OwnedNowPlaying } from "@/components/member/manage/owned-lists";

const PAGE_SIZE = 24;

// Now Playing in full: every game on the desk face-on, with the member's note
// and when they picked it up. The owner manages and reorders it here (spec
// api#451, pick 3A).
export default async function NowPlayingGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page }] = await Promise.all([params, searchParams]);
  const currentPage = pageNumber(page);

  const [data, owner] = await Promise.all([
    loadMemberList<UserNowPlaying>(id, "now_playing", PAGE_SIZE, currentPage),
    loadShelfOwner(id),
  ]);
  if (!data) notFound();
  const { user, list } = data;

  return (
    <ShelfManageProvider
      owner={owner}
      kind="now_playing"
      listName="Now Playing"
      entries={owner ? list.entries : []}
    >
      <MemberListTemplate
        userId={id}
        displayName={memberName(user)}
        title="Now playing"
        count={list.total}
        current="now_playing"
        counts={memberCounts(user)}
        action={owner && <ShelfAddButton kind="now_playing" />}
      >
        {owner ? (
          <OwnedNowPlaying
            entries={list.entries}
            offset={(currentPage - 1) * (list.per ?? PAGE_SIZE)}
          />
        ) : list.entries.length === 0 ? (
          <MemberListEmpty>Nothing in progress.</MemberListEmpty>
        ) : (
          <NowPlayingBooks entries={list.entries} showSince />
        )}

        <ListPagination
          currentPage={currentPage}
          totalPages={list.totalPages}
          buildHref={(p) =>
            `/members/${id}/now-playing-games${p > 1 ? `?page=${p}` : ""}`
          }
        />
      </MemberListTemplate>
    </ShelfManageProvider>
  );
}
