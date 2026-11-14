import { apiFetch } from "@/lib/api";
import { getFeatures, getSession } from "@/lib/session";
import type {
  ApiSingle,
  CollectionPlatformSummary,
  GameCollection,
} from "@/lib/api/types";
import { shownImportKinds } from "@/lib/imports/kinds";
import { fetchMember, fetchMemberList } from "@/lib/members/member-page";
import type { PlatformFilter } from "@/lib/members/collection-filter";

export const COLLECTION_PAGE_SIZE = 24;

// The collection: a page of owned games (filtered to a platform), the
// platform strip's counts, and whether the viewer can import more. Null when
// the member can't be read (a 404).
export async function loadCollectionPage(
  id: string,
  page: number,
  platformId: PlatformFilter,
) {
  const listQuery = new URLSearchParams({
    per: String(COLLECTION_PAGE_SIZE),
    page: String(page),
  });
  if (platformId) listQuery.set("platform_id", platformId);

  const [session, user, list, summaryRes] = await Promise.all([
    getSession(),
    fetchMember(id),
    fetchMemberList<GameCollection>(`/api/v1/users/${id}/collections?${listQuery}`),
    apiFetch(`/api/v1/users/${id}/collections/platform_summary`, {
      cache: "no-store",
    }),
  ]);
  if (!user) return null;
  const isSelf = session?.principal.discord_id === id;
  // The hub lists only the imports whose list this member is shown.
  const canImport = isSelf && shownImportKinds(await getFeatures()).length > 0;
  // The strip is an extra: if the summary fails, the list still renders.
  const summary: CollectionPlatformSummary | null = summaryRes.ok
    ? ((await summaryRes.json()) as ApiSingle<CollectionPlatformSummary>).data
    : null;
  return { user, canImport, list, summary };
}
