import type { GameKey } from "@/lib/api/types";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PageHeader, SectionHeading } from "@/components/templates/page-header";
import { DonateForm } from "@/components/giveaways/donate-form";
import { DonationList } from "@/components/giveaways/donation-list";

// The donate page: the form to wrap a key beside the Member's own donations
// (null when they couldn't be read), with how many were claimed.
export function DonateView({
  preview,
  keys,
  names,
}: {
  preview: boolean;
  keys: GameKey[] | null;
  names: Map<string, string>;
}) {
  const claimed = keys?.filter((k) => k.claimed_by_user_id).length ?? 0;
  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/giveaways", label: "Giveaways" }}
        title="Giveaways"
        badge={preview && <PreviewBadge />}
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
            <p className="mt-4 rounded-md border border-dashed border-border-strong px-5 py-6 text-faint-foreground">
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
