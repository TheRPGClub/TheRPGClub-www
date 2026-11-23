import { PreviewBadge } from "@/components/feature/preview-badge";
import { ListPagination } from "@/components/list-pagination";
import { YourDrafts } from "@/components/reviews/drafts/your-drafts";
import { fetchOwnDrafts } from "@/lib/reviews/drafts-read";
import { requireAuth, requireFeature } from "@/lib/session";

export const metadata = { title: "Your drafts" };

const PAGE_SIZE = 30;

// Your drafts: the viewer's own Drafts, newest last touched first. Only ever
// the signed-in member's own; nobody else's Drafts are read here.
export default async function YourDraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [session, features, { page = "1" }] = await Promise.all([
    requireAuth(),
    requireFeature("reviews"),
    searchParams,
  ]);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const read = await fetchOwnDrafts(session.principal.discord_id, {
    per: PAGE_SIZE,
    page: currentPage,
  });

  return (
    <YourDrafts
      read={read}
      page={currentPage}
      badge={features.preview("reviews") && <PreviewBadge />}
      pagination={
        read && (
          <ListPagination
            currentPage={currentPage}
            totalPages={read.totalPages}
            buildHref={(p) => `/reviews/drafts${p > 1 ? `?page=${p}` : ""}`}
          />
        )
      }
    />
  );
}
