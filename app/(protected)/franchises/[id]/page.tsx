import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  fetchFranchiseChanges,
  fetchFranchisePage,
  fetchFranchiseProgress,
  fetchFranchiseProgressMembers,
} from "@/lib/franchises/fetch";
import { getFeatures } from "@/lib/session";
import { FranchiseView } from "@/components/franchises/franchise-view";

// /franchises/:id (spec api#442): members-only (the protected layout), part
// of GameDB rather than a Feature. A merged Franchise sends the viewer on to
// the one it went into. `?view=history` opens the History view, which the
// API shows Regulars and above only. `?view=progress` opens Progress (spec
// api#457), for everyone the `franchise_progress` Feature is open to;
// `&member=<user id>` swaps its dials and covers to that member's.

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
  searchParams: Promise<{ view?: string | string[]; member?: string | string[] }>;
}) {
  const [{ id }, query, features] = await Promise.all([params, searchParams, getFeatures()]);
  const read = await fetchFranchisePage(franchiseId(id));
  if (read.status === "missing") notFound();
  const { page } = read;
  if (page.merged_into_id) redirect(`/franchises/${page.merged_into_id}`);
  const progressOpen = features.canOpen("franchise_progress");
  const [history, yours] = await Promise.all([
    page.viewer.can_edit ? fetchFranchiseChanges(page.franchise_id) : null,
    progressOpen ? fetchFranchiseProgress(page.franchise_id) : null,
  ]);
  const asked = first(query.view);
  const view = asked === "history" ? "history" : asked === "progress" && yours ? "progress" : "games";
  const member = first(query.member);
  const swapped = view === "progress" && member && member !== yours?.user_id ? member : null;
  const [members, theirs] =
    view === "progress"
      ? await Promise.all([
          fetchFranchiseProgressMembers(page.franchise_id),
          swapped ? fetchFranchiseProgress(page.franchise_id, swapped) : null,
        ])
      : [null, null];

  return (
    <FranchiseView
      page={page}
      history={history}
      view={view}
      progress={yours && { yours, theirs, members: members ?? [], preview: features.preview("franchise_progress") }}
      now={new Date().toISOString()}
      canStartChallenge={features.canOpen("challenges")}
    />
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
