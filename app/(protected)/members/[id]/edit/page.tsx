import { notFound, redirect } from "next/navigation";
import { getFeatures, requireAuth } from "@/lib/session";
import { fetchMemberEdit } from "@/lib/member-edit";
import { managedLists } from "@/lib/members/managed-lists";
import { importsHubHref, shownImportKinds } from "@/lib/imports/kinds";
import { MemberEditView } from "@/components/member/edit/member-edit-view";

// /members/:id/edit: the member's own profile editor (Socials, Linked
// Accounts, the Imports link). Anyone else is sent to the profile it edits.
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
  // Linked Accounts follow the flag only, like the Achievements pages whose
  // "link an account" button lands here.
  const linked = features.canOpen("achievement_hub");
  const data = await fetchMemberEdit(id, linked);
  if (!data) notFound();

  return (
    <MemberEditView
      data={data}
      linked={linked}
      lists={managedLists(id, features)}
      importsHref={
        shownImportKinds(features).length > 0 ? importsHubHref(data.user.user_id) : null
      }
    />
  );
}
