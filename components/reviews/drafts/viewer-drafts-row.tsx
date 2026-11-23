import { fetchOwnDrafts } from "@/lib/reviews/drafts-read";
import { DraftsRow } from "./drafts-row";

// The drafts row as the Review Feed drops it in, reading the viewer's own
// Drafts itself (stream it under a Suspense with no fallback). Nothing is
// drawn with no Drafts, or when they can't be read.
export async function ViewerDraftsRow({ viewerId }: { viewerId: string | null }) {
  if (!viewerId) return null;
  // Enough to name the newest few; the count comes from the listing's meta.
  const read = await fetchOwnDrafts(viewerId, { per: 3 });
  if (!read) return null;
  return <DraftsRow drafts={read.drafts} total={read.total} now={read.now} />;
}
