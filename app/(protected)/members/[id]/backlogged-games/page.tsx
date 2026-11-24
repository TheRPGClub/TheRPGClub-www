import { notFound } from "next/navigation";
import { Dices } from "lucide-react";
import type { UserBacklog } from "@/lib/api/types";
import { loadMemberList, pageNumber } from "@/lib/members/member-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { memberCounts } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { ListPagination } from "@/components/list-pagination";
import { BacklogGrid } from "@/components/member/lists/backlog-grid";
import { ButtonLink } from "@/components/ui/button";
import { loadShelfOwner } from "@/lib/members/shelf-manage";
import { ShelfManageProvider } from "@/components/member/manage/shelf-manage-context";
import { ShelfAddButton } from "@/components/member/manage/shelf-add-button";
import { OwnedBacklog } from "@/components/member/manage/owned-lists";

const PAGE_SIZE = 24;

// The backlog: what's queued up, in the member's order, each with its note
// and when it went on the list. The owner can have one picked for them, and
// manages the list here (spec api#451, pick 3A).
export default async function BackloggedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page }] = await Promise.all([params, searchParams]);
  const currentPage = pageNumber(page);

  const [data, owner] = await Promise.all([
    loadMemberList<UserBacklog>(id, "backlog", PAGE_SIZE, currentPage),
    loadShelfOwner(id),
  ]);
  if (!data) notFound();
  const { user, list } = data;
  const offset = (currentPage - 1) * (list.per ?? PAGE_SIZE);

  return (
    <ShelfManageProvider
      owner={owner}
      kind="backlog"
      listName="Backlog"
      entries={owner ? list.entries : []}
    >
      <MemberListTemplate
        userId={id}
        displayName={memberName(user)}
        title="Backlog"
        count={list.total}
        current="backlog"
        counts={memberCounts(user)}
        action={
          owner ? (
            <>
              <ButtonLink
                href={`/members/${id}/backlogged-games/pick`}
                variant="outline"
              >
                <Dices data-icon="inline-start" />
                Pick something to play
              </ButtonLink>
              <ShelfAddButton kind="backlog" />
            </>
          ) : undefined
        }
      >
        {owner ? (
          <OwnedBacklog entries={list.entries} offset={offset} />
        ) : (
          <BacklogGrid entries={list.entries} />
        )}

        <ListPagination
          currentPage={currentPage}
          totalPages={list.totalPages}
          buildHref={(p) =>
            `/members/${id}/backlogged-games${p > 1 ? `?page=${p}` : ""}`
          }
        />
      </MemberListTemplate>
    </ShelfManageProvider>
  );
}
