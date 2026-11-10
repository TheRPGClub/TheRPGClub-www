import { getFeatures, requireAuth } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { fetchDonatedKeys } from "@/lib/api/game-keys";
import { fetchMemberNames } from "@/lib/api/members";
import { PageHeader, SectionHeading } from "@/components/issue/page-header";
import { DonateForm } from "@/components/giveaways/donate-form";
import { DonationList } from "@/components/giveaways/donation-list";

export const metadata = { title: "Donate a key" };

// Donate a key, and manage the keys you've donated.
export default async function DonatePage() {
  const session = await requireAuth();
  const features = await getFeatures();
  const [keys, names] = await Promise.all([
    fetchDonatedKeys(session.principal.discord_id),
    fetchMemberNames(),
  ]);
  const claimed = keys?.filter((k) => k.claimed_by_user_id).length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giveaways"
        badge={features.preview("giveaways") && <PreviewBadge />}
        count="Donate and manage"
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,28.75rem)_minmax(0,1fr)] lg:gap-9">
        <div>
          <DonateForm />
        </div>
        <section aria-labelledby="your-donations">
          <SectionHeading
            title={<span id="your-donations">Your donations</span>}
            count={keys ? `${keys.length} ${keys.length === 1 ? "key" : "keys"} · ${claimed} claimed` : undefined}
          />
          {keys === null ? (
            <p role="alert" className="mt-3 text-destructive">
              {"Couldn't load your donations. Refresh to try again."}
            </p>
          ) : keys.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-rule-strong px-5 py-6 text-paper-mute">
              {"You haven't donated a key yet. Wrap one and it goes on the shelf."}
            </p>
          ) : (
            <DonationList keys={keys} names={Object.fromEntries(names)} />
          )}
        </section>
      </div>
    </div>
  );
}
