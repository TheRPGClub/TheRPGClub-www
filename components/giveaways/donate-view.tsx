import { PreviewBadge } from "@/components/feature/preview-badge";
import { PageHeader } from "@/components/templates/page-header";
import { DonateForm } from "@/components/giveaways/donate-form";

// The donate page: the parcel and its label (the form). The Member's own
// donations live under the Donated tab.
export function DonateView({
  preview,
  donorName,
}: {
  preview: boolean;
  donorName: string;
}) {
  return (
    <div className="space-y-10">
      <PageHeader
        back={{ href: "/giveaways/donated", label: "Your donations" }}
        title="Donate a key"
        badge={preview && <PreviewBadge />}
        description="Wrap it up for the shelf. The bot hands it to whoever claims it."
      />
      <DonateForm donorName={donorName} />
    </div>
  );
}
