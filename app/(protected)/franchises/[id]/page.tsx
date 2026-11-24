import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchFranchiseChanges, fetchFranchisePage } from "@/lib/franchises/fetch";
import { getFeatures } from "@/lib/session";
import { FranchiseView } from "@/components/franchises/franchise-view";

// /franchises/:id (spec api#442): members-only (the protected layout), part
// of GameDB rather than a Feature. A merged Franchise sends the viewer on to
// the one it went into. `?view=history` opens the History view, which the
// API shows Regulars and above only.

type Params = Promise<{ id: string }>;

function franchiseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return id;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const read = await fetchFranchisePage(franchiseId((await params).id)).catch(() => null);
  return { title: read?.status === "ok" ? `${read.page.name} (Franchise)` : "Franchise" };
}

export default async function FranchisePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const [{ id }, query, features] = await Promise.all([params, searchParams, getFeatures()]);
  const read = await fetchFranchisePage(franchiseId(id));
  if (read.status === "missing") notFound();
  const { page } = read;
  if (page.merged_into_id) redirect(`/franchises/${page.merged_into_id}`);
  const history = page.viewer.can_edit ? await fetchFranchiseChanges(page.franchise_id) : null;
  const view = (Array.isArray(query.view) ? query.view[0] : query.view) === "history" ? "history" : "games";

  return (
    <FranchiseView
      page={page}
      history={history}
      view={view}
      now={new Date().toISOString()}
      canStartChallenge={features.canOpen("challenges")}
    />
  );
}
