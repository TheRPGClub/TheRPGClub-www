import { notFound, redirect } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { isModeratorOrAbove } from "@/lib/staff";
import { fetchChallenge } from "@/lib/api/challenges";
import { draftFromChallenge } from "@/lib/challenges/form";
import { canEditChallenge } from "@/lib/challenges/permissions";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ChallengeForm } from "@/components/challenges/form/challenge-form";

// Edit a Challenge: its Host, or Moderators and above for a club-hosted one.
// Once it has a Run its rules are locked; a Format whose rules the website
// doesn't set up yet edits only its name, description and end date.
export default async function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const features = await requireFeature("challenges");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const read = await fetchChallenge(id);
  if (!read.ok) notFound();
  const challenge = read.data;
  if (
    !canEditChallenge(challenge, {
      id: session.principal.discord_id,
      membership: session.membership,
    })
  ) {
    redirect(`/challenges/${id}`);
  }
  const runCount = challenge.run_count ?? 0;
  return (
    <ChallengeForm
      initial={draftFromChallenge(challenge)}
      edit={{
        id,
        locked: runCount > 0 || !["pool", "assignment"].includes(challenge.challenge_format),
        closedForGood: !!challenge.ended_at,
      }}
      staff={isModeratorOrAbove(session.membership)}
      runCount={runCount}
      badge={features.preview("challenges") && <PreviewBadge />}
    />
  );
}
