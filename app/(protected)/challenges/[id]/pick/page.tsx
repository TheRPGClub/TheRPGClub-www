import { notFound } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { loadPickPage } from "@/lib/challenges/pick-page";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { PickPageView } from "@/components/challenges/assignment/pick-page-view";

// A Santa's private pick page for an Assignment (Secret Santa) Challenge's
// Edition (`?edition=`, else the one in picking): their recipient's eligible
// backlog, one game at a time, and their pick. The API serves it only to that
// Edition's Santa; anyone else gets its refusal as a notice slip.
export default async function SantaPickPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edition?: string }>;
}) {
  await requireAuth();
  const features = await requireFeature("challenges");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const edition = Number((await searchParams).edition);
  const page = await loadPickPage(id, Number.isInteger(edition) && edition > 0 ? edition : null);
  if (page === "not-found") notFound();
  if (page === "unread") {
    return (
      <NoticeSlip title="Not just now" role="alert" className="mt-8 max-w-xl">
        This Challenge couldn&apos;t be read. Try again in a moment.
      </NoticeSlip>
    );
  }
  return <PickPageView page={page} badge={features.preview("challenges") && <PreviewBadge />} />;
}
