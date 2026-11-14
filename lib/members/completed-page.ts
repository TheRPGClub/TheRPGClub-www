import { getFeatures, getSession } from "@/lib/session";
import type { GameCompletion } from "@/lib/api/types";
import { shownImportKinds } from "@/lib/imports/kinds";
import { fetchAllCompletions } from "@/components/member/member-lists-server";
import { completedYearView } from "@/lib/members/completed-years";
import { fetchMember, fetchMemberList } from "@/lib/members/member-page";

// Completed games, a year at a time: the year dial picks the year (newest by
// default), the spotlight shows one completion in full, and the filmstrip
// runs through the year's completions by month. A search looks across every
// year.

export const COMPLETED_PAGE_SIZE = 48;

// The member, the viewer, the year view and the shown page of completions;
// null when the member can't be read (a 404).
export async function loadCompletedPage(
  id: string,
  { page, q, yearParam }: { page: number; q: string; yearParam: string },
) {
  const [session, user, history] = await Promise.all([
    getSession(),
    fetchMember(id),
    fetchAllCompletions(id),
  ]);
  if (!user) return null;
  const isSelf = session?.principal.discord_id === id;
  // The hub lists only the imports whose list this member is shown.
  const canImport = isSelf && shownImportKinds(await getFeatures()).length > 0;

  const view = completedYearView({
    userId: id,
    history,
    yearParam,
    q,
    pageSize: COMPLETED_PAGE_SIZE,
  });
  const listQuery = new URLSearchParams({
    per: String(COMPLETED_PAGE_SIZE),
    page: String(page),
  });
  if (view.year !== "all") listQuery.set("year", view.year);
  if (q) listQuery.set("q", q);
  const list = await fetchMemberList<GameCompletion>(
    `/api/v1/users/${id}/completions?${listQuery}`,
  );

  return {
    user,
    viewer: { signedIn: session !== null, isSelf, canImport },
    view,
    list,
    // The dial covers only this many completions when the history was capped.
    cappedAt: history?.capped ? history.entries.length : null,
  };
}

export type CompletedPage = NonNullable<Awaited<ReturnType<typeof loadCompletedPage>>>;
