import type { GameKey } from "@/lib/api/types";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PageHeader, SectionHeading } from "@/components/templates/page-header";
import { DonateForm } from "@/components/giveaways/donate-form";
import { DonationList } from "@/components/giveaways/donation-list";

// The donate page: the parcel and its label (the form), then the Member's own
// donations (null when they couldn't be read), with how many were claimed.
export function DonateView({
  preview,
  keys,
  names,
  donorName,
}: {
  preview: boolean;
  keys: GameKey[] | null;
  names: Map<string, string>;
  donorName: string;
}) {
  const claimed = keys?.filter((k) => k.claimed_by_user_id).length ?? 0;
  return (
    <div className="space-y-10">
      <PageHeader
        back={{ href: "/giveaways", label: "Giveaways" }}
        title="Donate a key"
        badge={preview && <PreviewBadge />}
        description="Wrap it up for the shelf. The bot hands it to whoever claims it."
      />
      <DonateForm donorName={donorName} />
      <section aria-labelledby="your-donations">
        <SectionHeading
          title={<span id="your-donations">Your donations</span>}
          count={keys ? `${keys.length} ${keys.length === 1 ? "key" : "keys"} · ${claimed} claimed` : undefined}
        />
        <div className="mt-5">
          {keys === null ? (
            <p role="alert" className="text-destructive">
              {"Couldn't load your donations. Refresh to try again."}
            </p>
          ) : keys.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-strong px-5 py-6 text-faint-foreground">
              {"You haven't donated a key yet. Wrap one and it goes on the shelf."}
            </p>
          ) : (
            <DonationList keys={keys} names={Object.fromEntries(names)} />
          )}
        </div>
      </section>
    </div>
  );
}
