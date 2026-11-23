import { requireAuth, requireFeature } from "@/lib/session";
import { isModeratorOrAbove, isRegularOrStaff } from "@/lib/staff";
import { emptyDraft } from "@/lib/challenges/form";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PageHeader } from "@/components/templates/page-header";
import { ButtonLink } from "@/components/ui/button";
import { ChallengeForm } from "@/components/challenges/form/challenge-form";

// New Challenge: Regulars and staff (the API's create gate), who become its
// Host; staff may host it for the club.
export default async function NewChallengePage() {
  const session = await requireAuth();
  const features = await requireFeature("challenges");
  const badge = features.preview("challenges") && <PreviewBadge />;
  if (!isRegularOrStaff(session.membership)) {
    return (
      <div className="space-y-6">
        <PageHeader
          back={{ href: "/challenges", label: "Challenges" }}
          title="New Challenge"
          badge={badge}
          description="You need the Regulars role to create a Challenge. If you think your role is out of date, sign out and back in to refresh it from Discord."
        />
        <ButtonLink href="/challenges" variant="outline">
          See the Challenges
        </ButtonLink>
      </div>
    );
  }
  return (
    <ChallengeForm
      initial={emptyDraft()}
      edit={null}
      staff={isModeratorOrAbove(session.membership)}
      runCount={0}
      badge={badge}
    />
  );
}
