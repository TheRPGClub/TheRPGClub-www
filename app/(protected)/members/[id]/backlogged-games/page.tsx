import { notFound } from "next/navigation";
import { Dices } from "lucide-react";
import { getSession } from "@/lib/session";
import type { UserBacklog } from "@/lib/api/types";
import { loadMemberList, pageNumber } from "@/lib/members/member-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { memberCounts, memberName } from "@/components/member/member-lists";
import { ListPagination } from "@/components/list-pagination";
import { BacklogGrid } from "@/components/member/lists/backlog-grid";
import { ButtonLink } from "@/components/ui/button";

const PAGE_SIZE = 24;

// The backlog: what's queued up, in the member's order, each with its note
// and when it went on the list. The owner can have one picked for them.
export default async function BackloggedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page }] = await Promise.all([params, searchParams]);
  const currentPage = pageNumber(page);

  const [data, session] = await Promise.all([
    loadMemberList<UserBacklog>(id, "backlog", PAGE_SIZE, currentPage),
    getSession(),
  ]);
  if (!data) notFound();
  const { user, list } = data;
  const isSelf = session?.principal.discord_id === id;

  return (
    <MemberListTemplate
      userId={id}
      displayName={memberName(user)}
      title="Backlog"
      count={list.total}
      current="backlog"
      counts={memberCounts(user)}
      action={
        isSelf ? (
          <ButtonLink href={`/members/${id}/backlogged-games/pick`} variant="highlight">
            <Dices data-icon="inline-start" />
            Pick something to play
          </ButtonLink>
        ) : undefined
      }
    >
      <BacklogGrid entries={list.entries} />

      <ListPagination
        currentPage={currentPage}
        totalPages={list.totalPages}
        buildHref={(p) => `/members/${id}/backlogged-games${p > 1 ? `?page=${p}` : ""}`}
      />
    </MemberListTemplate>
  );
}
