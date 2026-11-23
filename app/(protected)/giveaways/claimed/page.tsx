import Link from "next/link";
import { requireAuth, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { fetchClaimedKeys } from "@/lib/api/game-keys";
import { fetchMemberNames } from "@/lib/api/members";
import { PageHeader } from "@/components/templates/page-header";
import { ClaimedKeysTable } from "@/components/giveaways/claimed-keys-table";

export const metadata = { title: "Your claimed keys" };

// Every key the member has claimed, newest claim first, with the key itself
// (masked until asked), so a claimed key is never lost.
export default async function ClaimedKeysPage() {
  const session = await requireAuth();
  const features = await requireFeature("giveaways");
  const [keys, names] = await Promise.all([
    fetchClaimedKeys(session.principal.discord_id),
    fetchMemberNames(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/giveaways", label: "Giveaways" }}
        title="Your claimed keys"
        badge={features.preview("giveaways") && <PreviewBadge />}
        count={keys ? `${keys.length} ${keys.length === 1 ? "key" : "keys"}` : undefined}
        description="Each key you claim stays here. The bot also sent each one to your Discord DMs when you claimed it."
      />
      {keys === null ? (
        <p role="alert" className="text-destructive">
          {"Couldn't load your claimed keys. Refresh to try again."}
        </p>
      ) : keys.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong px-5 py-8 text-faint-foreground">
          {"You haven't claimed a key yet. "}
          <Link href="/giveaways" className="text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight">
            See the shelf
          </Link>
          .
        </p>
      ) : (
        <ClaimedKeysTable keys={keys} names={names} />
      )}
    </div>
  );
}
