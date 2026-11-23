import { requireAuth, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { canSuggest } from "@/lib/suggestions";
import { PageHeader } from "@/components/templates/page-header";
import { SuggestionForm } from "@/components/suggestions/suggestion-form";
import { ButtonLink } from "@/components/ui/button";

// Suggest something: a change to the club's bot or this website, pinned to
// the Suggestion Board as Pending. Members role holders and staff only, as
// the API's create gate.
const BACK = { href: "/suggestions", label: "Suggestion Board" };

export default async function SuggestSomethingPage() {
  const session = await requireAuth();
  const features = await requireFeature("suggestions");
  const badge = features.preview("suggestions") && <PreviewBadge />;
  const { principal } = session;

  if (!canSuggest(session.membership)) {
    return (
      <div className="space-y-6">
        <PageHeader
          back={BACK}
          title="Suggest something"
          badge={badge}
          description="Only Members role holders and staff can suggest something. If you think your role is out of date, sign out and back in to refresh it from Discord."
        />
        <ButtonLink href="/suggestions" variant="outline">
          See the Suggestion Board
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        back={BACK}
        title="Suggest something"
        badge={badge}
        count="For the bot or the website"
      />
      <SuggestionForm
        authorId={principal.discord_id}
        authorName={principal.global_name ?? principal.username}
      />
    </div>
  );
}
