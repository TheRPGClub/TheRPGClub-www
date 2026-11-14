import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import {
  parseBacklogPickParams,
  type BacklogPickSearchParams,
} from "@/lib/api/backlog-pick";
import { dealHand, loadPickPlatforms } from "@/lib/members/backlog-deal";
import { fetchMember } from "@/lib/members/member-page";
import { PickSentence } from "@/components/issue/member-pick-sentence";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { memberCounts } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { PickEmpty } from "@/components/member/pick/pick-empty";
import { PickHand } from "@/components/member/pick/pick-hand";

// The backlog picker deals the owner a hand of three from their backlog (see
// lib/members/backlog-deal.ts); the whole hand lives in the URL.
export default async function BacklogPickPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<BacklogPickSearchParams>;
}) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const session = await requireAuth();
  if (session.principal.discord_id !== id) {
    redirect(`/members/${id}/backlogged-games`);
  }

  const filters = parseBacklogPickParams(raw);
  const [user, deal] = await Promise.all([fetchMember(id), dealHand(id, filters)]);
  if (!user) notFound();

  const meta = deal.kind === "error" ? null : deal.meta;
  const platforms =
    deal.kind === "ok" && deal.picks.some((p) => p.platform_id === null)
      ? await loadPickPlatforms()
      : undefined;

  return (
    <MemberListTemplate
      userId={id}
      displayName={memberName(user)}
      title="Pick something to play"
      current="backlog"
      counts={memberCounts(user)}
    >
      <PickSentence filters={filters} meta={meta} />

      {deal.kind === "error" && (
        <p
          role="alert"
          className="rounded-sm border border-dashed border-border-strong px-4 py-10 text-center text-sm text-destructive"
        >
          {deal.message}
        </p>
      )}
      {deal.kind === "empty" && (
        <PickEmpty userId={id} filters={filters} total={deal.meta.total} />
      )}
      {deal.kind === "ok" && (
        <PickHand userId={id} deal={deal} filters={filters} platforms={platforms} />
      )}
    </MemberListTemplate>
  );
}
