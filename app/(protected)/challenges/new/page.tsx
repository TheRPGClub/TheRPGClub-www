import { requireAuth, requireFeature } from "@/lib/session";
import { isModeratorOrAbove } from "@/lib/staff";
import { emptyDraft } from "@/lib/challenges/form";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ChallengeForm } from "@/components/challenges/form/challenge-form";

// New Challenge: any member hosts a Slots or Pool Challenge (spec api#442);
// staff may also make an Assignment one and host it for the club.
export default async function NewChallengePage() {
  const session = await requireAuth();
  const features = await requireFeature("challenges");
  return (
    <ChallengeForm
      initial={emptyDraft()}
      edit={null}
      staff={isModeratorOrAbove(session.membership)}
      runCount={0}
      badge={features.preview("challenges") && <PreviewBadge />}
    />
  );
}
