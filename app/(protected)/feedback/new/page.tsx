import { requireAuth, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { canGiveFeedback } from "@/lib/feedback";
import { PageHeader } from "@/components/templates/page-header";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { ButtonLink } from "@/components/ui/button";

// Give feedback: a Feature Request or Suggestion for the club's bot or this
// website, pinned to the Feedback Board as Pending. Members role holders and
// staff only, as the API's create gate. Interim: www#226 remakes this page.
const BACK = { href: "/feedback", label: "Feedback Board" };

export default async function GiveFeedbackPage() {
  const session = await requireAuth();
  const features = await requireFeature("feedback");
  const badge = features.preview("feedback") && <PreviewBadge />;
  const { principal } = session;

  if (!canGiveFeedback(session.membership)) {
    return (
      <div className="space-y-6">
        <PageHeader
          back={BACK}
          title="Give feedback"
          badge={badge}
          description="Only Members role holders and staff can give feedback. If you think your role is out of date, sign out and back in to refresh it from Discord."
        />
        <ButtonLink href="/feedback" variant="outline">
          See the Feedback Board
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        back={BACK}
        title="Give feedback"
        badge={badge}
        count="For the bot or the website"
      />
      <FeedbackForm
        authorId={principal.discord_id}
        authorName={principal.global_name ?? principal.username}
      />
    </div>
  );
}
