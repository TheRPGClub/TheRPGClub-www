import { notFound, redirect } from "next/navigation";
import { getFeatures, requireAuth } from "@/lib/session";
import { igdbAddBlockedReason } from "@/lib/igdb";
import { fetchMemberEdit, memberEditShown } from "@/lib/member-edit";
import { importsHubHref, shownImportKinds } from "@/lib/imports/kinds";
import { MemberEditView } from "@/components/member/edit/member-edit-view";

// /members/:id/edit: the member's own profile editor. Anyone else is sent to
// the profile it edits.
export default async function MemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  if (session.principal.discord_id !== id) {
    redirect(`/members/${id}`);
  }

  const features = await getFeatures();
  const shown = memberEditShown(features);
  const data = await fetchMemberEdit(id, shown);
  if (!data) notFound();

  return (
    <MemberEditView
      data={data}
      shown={shown}
      igdbBlockedReason={igdbAddBlockedReason(true, session.membership)}
      importsHref={
        shownImportKinds(features).length > 0 ? importsHubHref(data.user.user_id) : null
      }
    />
  );
}
