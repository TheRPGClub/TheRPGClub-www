import { requireAuth, requireFeature } from "@/lib/session";
import { fetchMemberNames } from "@/lib/api/members";
import { DonateView } from "@/components/giveaways/donate-view";

export const metadata = { title: "Donate a key" };

// Donate a key. The keys you've donated are under the Donated tab.
export default async function DonatePage() {
  const session = await requireAuth();
  const features = await requireFeature("giveaways");
  const names = await fetchMemberNames();
  const viewerId = session.principal.discord_id;
  return (
    <DonateView
      preview={features.preview("giveaways")}
      donorName={names.get(viewerId) ?? session.principal.global_name ?? session.principal.username}
    />
  );
}
